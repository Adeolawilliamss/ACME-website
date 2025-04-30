import connectToDatabase from "./mongoose";
import Invoice from "./models/invoiceModel";
import Customer from "./models/customerModel";
import { formatCurrency } from "./utils";

const ITEMS_PER_PAGE = 10;

export async function fetchRevenue() {
  await connectToDatabase();
  try {
    // 1. Get all paid invoices and group by month
    const revenueData = await Invoice.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Format to { month: 'Apr', revenue: 500 }
    const formatted = revenueData.map((item) => ({
      month: new Date(`${item._id}-01`).toLocaleString("default", {
        month: "short",
      }),
      revenue: item.revenue,
    }));

    return formatted;
  } catch (err) {
    console.error("Error fetching revenue:", err);
    throw new Error("Could not fetch revenue");
  }
}

export async function fetchLatestInvoices() {
  await connectToDatabase();
  try {
    const invoices = await Invoice.aggregate([
      {
        $sort: { date: -1 } // Sort by latest date first
      },
      {
        $group: {
          _id: "$customer", // Group by customer
          invoice: { $first: "$$ROOT" } // Keep only the latest one per customer
        }
      },
      {
        $replaceRoot: { newRoot: "$invoice" } // Flatten the structure
      },
      {
        $limit: 5
      }
    ]);

    // Populate customer info manually
    const populated = await Customer.populate(invoices, {
      path: "customer",
      select: "name email photo",
    });

    const latestInvoices = populated.map((invoice) => ({
      id: invoice._id.toString(),
      amount: formatCurrency(invoice.amount),
      name: invoice.customer?.name || "Unknown",
      email: invoice.customer?.email || "Unknown",
      image_url: `/${invoice.customer?.photo || "default.png"}`,
    }));

    return latestInvoices;
  } catch (error) {
    console.error("Failed to fetch latest invoices:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}


export async function fetchCardData() {
  await connectToDatabase();
  try {
    const [numberOfInvoices, numberOfCustomers, paidAgg, pendingAgg] =
      await Promise.all([
        Invoice.countDocuments(),
        Customer.countDocuments(),
        Invoice.aggregate([
          { $match: { status: "Paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Invoice.aggregate([
          { $match: { status: "Pending" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const totalPaid = paidAgg[0]?.total || 0;
    const totalPending = pendingAgg[0]?.total || 0;

    return {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices: formatCurrency(totalPaid),
      totalPendingInvoices: formatCurrency(totalPending),
    };
  } catch (error) {
    console.error("MongoDB Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  await connectToDatabase();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await Invoice.find({
      $or: [
        { status: { $regex: query, $options: "i" } },
        { amount: { $regex: query, $options: "i" } }, // Might need to format amount as string elsewhere
      ],
    })
      .populate({
        path: "customer",
        match: {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
        select: "name email photo",
      })
      .sort({ date: -1 })
      .skip(offset)
      .limit(ITEMS_PER_PAGE)
      .lean();

    return invoices.filter((inv) => inv.customer); // filter out unmatched customer population
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  await connectToDatabase();
  try {
    const count = await Invoice.countDocuments({
      $or: [
        { status: { $regex: query, $options: "i" } },
        { amount: { $regex: query, $options: "i" } },
      ],
    });

    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  await connectToDatabase();
  try {
    const invoice = await Invoice.findById(id).lean();

    if (!invoice) throw new Error("Invoice not found");

    return {
      ...invoice,
      amount: invoice.amount / 100,
    };
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  await connectToDatabase();
  try {
    const customers = await Customer.find({}, "id name")
      .sort({ name: 1 })
      .lean();
    return customers;
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  await connectToDatabase();
  try {
    const customers = await Customer.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "customer",
          as: "invoices",
        },
      },
      {
        $addFields: {
          total_invoices: { $size: "$invoices" },
          total_pending: {
            $sum: {
              $map: {
                input: "$invoices",
                as: "invoice",
                in: {
                  $cond: [
                    { $eq: ["$$invoice.status", "Pending"] },
                    "$$invoice.amount",
                    0,
                  ],
                },
              },
            },
          },
          total_paid: {
            $sum: {
              $map: {
                input: "$invoices",
                as: "invoice",
                in: {
                  $cond: [
                    { $eq: ["$$invoice.status", "Paid"] },
                    "$$invoice.amount",
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          email: 1,
          image_url: "$photo",
          total_invoices: 1,
          total_pending: 1,
          total_paid: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return customers.map((c) => ({
      ...c,
      total_pending: formatCurrency(c.total_pending),
      total_paid: formatCurrency(c.total_paid),
    }));
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

const catchAsync = require('../utils/catchAsync');
const Invoice = require('../models/invoiceModel');
const Customer = require('../models/customerModel');

exports.getInvoiceCardsData = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const [invoiceCount, customerCount, paidAgg, pendingAgg] =
    await Promise.all([
      Invoice.countDocuments({ user: userId }),
      Customer.countDocuments(),
      Invoice.aggregate([
        { $match: { user: userId, status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Invoice.aggregate([
        { $match: { user: userId, status: 'Pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

  res.status(200).json({
    numberOfInvoices: invoiceCount,
    numberOfCustomers: customerCount,
    totalPaidInvoices: paidAgg[0]?.total || 0,
    totalPendingInvoices: pendingAgg[0]?.total || 0,
  });
});


exports.getLatestInvoicesData = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const invoices = await Invoice.aggregate([
    { $match: { user: userId } },  // <-- filter invoices by current user
    { $sort: { date: -1 } },
    { $group: {
      _id: '$customer',
      invoice: { $first: '$$ROOT' },
    }},
    { $replaceRoot: { newRoot: '$invoice' } },
    { $limit: 5 },
  ]);

  const populated = await Customer.populate(invoices, {
    path: 'customer',
    select: 'name email photo',
  });

  const formatCurrency = (amount) => amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const latestInvoices = populated.map((invoice) => ({
    id: invoice._id.toString(),
    amount: formatCurrency(invoice.amount),
    name: invoice.customer?.name || 'Unknown',
    email: invoice.customer?.email || 'Unknown',
    image_url: `/${invoice.customer?.photo || 'default.png'}`,
  }));

  res.status(200).json({
    status: 'success',
    results: latestInvoices.length,
    data: latestInvoices,
  });
});


exports.getRevenue = catchAsync(async (req, res, next) => {
  // 1) Aggregate across *all* user invoices, grouping only by month number (1–12)
  const revenueData = await Invoice.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: { $month: "$date" },        // month number 1–12
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { "_id": 1 } }             // ensure months come out in order 1→12
  ]);

  // 2) Turn it into a Map for O(1) lookups:
  //      key: month number (1–12), value: total revenue
  const revMap = new Map(revenueData.map(({ _id, revenue }) => [ _id, revenue ]));

  // 3) Build your 12‐entry array Jan→Dec, filling in zeros where needed
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthName = new Date(0, i).toLocaleString("default", { month: "short" });
    return {
      month: monthName,
      revenue: revMap.get(monthNum) || 0,
    };
  });

  res.status(200).json({
    status: "success",
    results: months.length,
    data: months,
  });
});;


exports.createInvoices = catchAsync(async (req, res, next) => {
  const userId = req.user?._id; // assuming req.user is set via middleware
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }
  const { customer, amount, status } = req.body;
  

  const invoice = await Invoice.create({
    user: userId,
    customer,
    amount,
    status,
  });

  res.status(200).json({
    status: 'success',
    data: {
      invoice,
    },
  });
});

exports.fetchFilteredInvoices = catchAsync(async (req, res, next) => {
  const currentPage = parseInt(req.query.page) || 1;
  const ITEMS_PER_PAGE = 10;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const invoices = await Invoice.find({ user: req.user._id })
    .populate({
      path: 'customer',
      select: 'name email photo',
    })
    .sort({ date: -1 })
    .skip(offset)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const filtered = invoices.map((inv) => ({
    id: inv._id.toString(),
    name: inv.customer.name,
    email: inv.customer.email,
    status: inv.status,
    amount: inv.amount,
    date: inv.date,
    image_url: `/${inv.customer.photo}`,
  }));

  res.status(200).json({ invoices: filtered });
});



exports.filteredSearch = catchAsync(async (req, res, next) => {
  const query = req.query.query || '';
  const currentPage = parseInt(req.query.page) || 1;
  const ITEMS_PER_PAGE = 10;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const isNumber = !isNaN(query);

  const searchConditions = [];

  if (query) {
    searchConditions.push(
      { status: { $regex: query, $options: 'i' } },
      isNumber ? { amount: Number(query) } : null,
      { 'customer.name': { $regex: query, $options: 'i' } },
      { 'customer.email': { $regex: query, $options: 'i' } }
    );
  }

  const invoices = await Invoice.aggregate([
    { $match: { user: req.user._id } }, // <-- user filter
    { $lookup: {
      from: 'customers',
      localField: 'customer',
      foreignField: '_id',
      as: 'customer',
    }},
    { $unwind: '$customer' },
    {
      $match: searchConditions.length
        ? { $or: searchConditions.filter(Boolean) }
        : {},
    },
    { $sort: { date: -1 } },
    { $skip: offset },
    { $limit: ITEMS_PER_PAGE },
    {
      $project: {
        id: '$_id',
        name: '$customer.name',
        email: '$customer.email',
        status: 1,
        amount: 1,
        date: 1,
        image_url: { $concat: ['/', '$customer.photo'] },
      },
    },
  ]);

  res.status(200).json({ invoices });
});


exports.fetchFilteredPages = catchAsync(async (req, res, next) => {
  const allInvoices = await Invoice.find({ user: req.user._id }).populate(
    'customer',
    'name photo email',
  );

  res.status(200).json({
    status: 'Success',
    data: {
      allInvoices,
    },
  });
});


exports.deleteInvoice = catchAsync(async (req, res, next) => {
  // const { id } = req.params;
  // const invoice = await Invoice.findById(id);

  // if (!invoice || invoice.user.toString() !== req.user._id.toString()) {
  //   return res.status(404).json({ status: 'fail', message: 'Invoice not found or unauthorized' });
  // }

  // await Invoice.findByIdAndDelete(id);

  // res.status(204).json({ status: 'success', data: null });
});


exports.updateInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const invoice = await Invoice.findById(id);

  if (!invoice || invoice.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ status: 'fail', message: 'Invoice not found or unauthorized' });
  }

  const updatedInvoice = await Invoice.findByIdAndUpdate(
    id,
    {
      customer: req.body.customerId,
      amount: req.body.amount,
      status: req.body.status,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: updatedInvoice,
  });
});


exports.getInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const inv = await Invoice.findById(id).populate('customer', 'name email photo');

  if (!inv || inv.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ status: 'fail', message: 'Invoice not found or unauthorized' });
  }

  const invoice = {
    id: inv._id.toString(),
    customer_id: inv.customer._id.toString(),
    amount: inv.amount,
    status: inv.status.toLowerCase(),
  };

  res.status(200).json({ status: 'success', data: { invoice } });
});


exports.getAllInvoices = catchAsync(async (req, res, next) => {
  let allInvoices;

  if (req.user.role === 'Admin') {
    allInvoices = await Invoice.find().populate('customer', 'name photo email');
  } else {
    allInvoices = await Invoice.find({ user: req.user.id }).populate('customer', 'name photo email');
  }

  res.status(200).json({
    status: 'Success',
    data: {
      allInvoices,
    },
  });
});


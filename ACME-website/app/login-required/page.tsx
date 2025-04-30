import Link from 'next/link';
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "@/app/ui/button";

export default function LoginRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h1>
        <p className="text-gray-600 mb-6">
          You must be logged in to view this page.
        </p>
        <Link
          href="/login"
        >
          <Button className="mt-4 w-full">
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        </Link>
      </div>
    </div>
  );
}

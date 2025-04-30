'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Pagination() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  // hardcode pages 1, 2, 3
  const allPages = [1, 2, 3];

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(pageNumber));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center mt-6">
      <div className="inline-flex items-center space-x-1">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        {allPages.map((page, idx) => {
          const isActive = page === currentPage;
          const position =
            allPages.length === 1
              ? 'single'
              : idx === 0
              ? 'first'
              : idx === allPages.length - 1
              ? 'last'
              : undefined;

          return (
            <PaginationNumber
              key={page}
              page={page}
              href={createPageURL(page)}
              isActive={isActive}
              position={position}
            />
          );
        })}

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= allPages.length}
        />
      </div>
    </div>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number;
  href: string;
  isActive: boolean;
  position?: 'first' | 'last' | 'single';
}) {
  const cls = clsx(
    'flex h-10 w-10 items-center justify-center dark:text-white border text-sm transition-all duration-200',
    {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'bg-blue-600 border-blue-600 text-white': isActive,
      'hover:bg-gray-100 text-gray-700': !isActive,
    }
  );

  return (
    <Link href={href} className={cls}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled: boolean;
}) {
  const cls = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border text-gray-700 transition-all duration-200',
    {
      'pointer-events-none text-gray-300 border-gray-200': isDisabled,
      'hover:bg-gray-100': !isDisabled,
      'mr-2': direction === 'left',
      'ml-2': direction === 'right',
    }
  );

  const Icon = direction === 'left' ? ArrowLeftIcon : ArrowRightIcon;

  return isDisabled ? (
    <div className={cls}>
      <Icon className="w-4 h-4" />
    </div>
  ) : (
    <Link href={href} className={cls}>
      <Icon className="w-4 h-4" />
    </Link>
  );
}

// 'use client';

// import React from 'react';
// import { useAlert } from '../context/alertContext';

// const Alert: React.FC = () => {
//   const { alert } = useAlert();

//   if (!alert) return null;

//   const baseClasses =
//     'fixed top-0 left-1/2 -translate-x-1/2 z-[9999] text-white text-lg font-normal text-center rounded-b-md px-40 py-4 shadow-2xl whitespace-nowrap';

//   const alertColor =
//     alert.type === 'success' ? 'bg-green-600' : 'bg-red-600';

//   return <div className={`${baseClasses} ${alertColor}`}>{alert.msg}</div>;
// };

// export default Alert;

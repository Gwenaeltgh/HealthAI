import React from 'react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs }) => {
  return (
    <nav className="flex items-center space-x-2">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={index}>
          <Link to={breadcrumb.path} className="text-blue-600 hover:underline">
            {breadcrumb.label}
          </Link>
          {index < breadcrumbs.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
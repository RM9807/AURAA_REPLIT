import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            {item.onClick && !item.isActive ? (
              <button
                onClick={item.onClick}
                className="font-inter text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={`font-inter ${
                  item.isActive 
                    ? 'text-gray-900 font-semibold' 
                    : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
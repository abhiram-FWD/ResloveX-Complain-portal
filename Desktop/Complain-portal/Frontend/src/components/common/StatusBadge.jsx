import { getStatusColor } from '../../utils/statusHelpers';

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(status)}`}>
    {status.replace('_', ' ')}
  </span>
);
export default StatusBadge;

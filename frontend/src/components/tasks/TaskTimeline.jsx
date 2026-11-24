import { formatDate, formatDateTime } from '../../utils/date';

// Simple vertical timeline: Created -> Start -> Due -> Completed / Cancelled
const TaskTimeline = ({ task }) => {
  const steps = [
    { title: 'Created', date: formatDateTime(task.createdAt), type: 'done' },
    { title: 'Start date', date: formatDate(task.startDate), type: 'info' },
    {
      title: task.isOverdue ? 'Due date (missed)' : 'Due date',
      date: formatDate(task.dueDate),
      type: task.isOverdue ? 'danger' : '',
    },
  ];

  if (task.status === 'Completed') {
    steps.push({ title: 'Completed', date: formatDateTime(task.completedDate), type: 'done' });
  } else if (task.status === 'Cancelled') {
    steps.push({ title: 'Cancelled', date: formatDateTime(task.updatedAt), type: 'danger' });
  } else {
    steps.push({ title: `Currently ${task.status}`, date: 'Waiting for completion', type: '' });
  }

  return (
    <ul className="timeline">
      {steps.map((step) => (
        <li key={step.title} className="timeline-item">
          <span className={`timeline-dot ${step.type}`} />
          <div className="timeline-title">{step.title}</div>
          <div className="timeline-date">{step.date}</div>
        </li>
      ))}
    </ul>
  );
};

export default TaskTimeline;

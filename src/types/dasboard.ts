export type PipelineItem = {
  label: string;
  count: number;
  color: string;
};

export type Payment = {
  student: string;
  amount: string;
  date: string;
  status: string;
};

export type Stat = {
  label: string;
  value: string;
  color: string;
};

export type Session = {
  student: string;
  program: string;
  date: string;
  status: string;
};

export type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: any;
  bg: string;
  text: string;
};

export type StatusBadgeProps = {
  status: string;
};
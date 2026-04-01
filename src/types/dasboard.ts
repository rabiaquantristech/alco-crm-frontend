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
  change?: string;
  icon: any;
  iconColor: any;
  bg?: string;
  text?: string;
  progress?: number;
  iconBg?: string;
  sub?: any;
};

export type StatusBadgeProps = {
  status: string;
};
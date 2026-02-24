export interface AlertTypes {
  text: string;
  customIcon?: React.ReactNode | JSX.Element;
  className?: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  noIcon?: boolean
}

export interface Icons extends React.RefAttributes<SVGSVGElement>, AlertTypes {
  title: string;
}
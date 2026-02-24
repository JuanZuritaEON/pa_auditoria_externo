export interface ButtonTypes extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: 'primary' | 'outline-primary' | 'secondary' |'outline-secondary' | 'warning' | 'outline-warning' | 'danger' | 'outline-danger';
  size?: 'md' | 'lg' | 'sm',
  classnames?: string,
  isLink?: boolean,
  link?: string,
  onClickAnchor?: () => void
}
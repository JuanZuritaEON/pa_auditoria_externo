import { Progress } from "../../Redux"

const ProgressIcon = ({ progress }: Progress) => <span>{parseInt((progress * 100).toFixed(0))}%</span>

export default ProgressIcon
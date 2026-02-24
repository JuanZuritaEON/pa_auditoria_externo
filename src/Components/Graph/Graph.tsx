import { useState, useCallback } from "react"
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { GraphColors, PieGraphProps, Texts } from "../../Redux"
import { formatNumber, getIconPerStatus } from "../../Utils"
import { Alert, Button, Typography } from '..'
import './Graph.css'

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props

  return (
    <g>
      <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={fill} className="textBold">
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor={'middle'}
        fill="#333"
      >{`Firmas: ${formatNumber.format(value)}`}</text>
      <text
        x={cx}
        y={cy + 10}
        dy={18}
        textAnchor={'middle'}
        fill="#999"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  )
}

export const Graph = ({ allConsults, controlFigs, onClickAnchor, required, type }: PieGraphProps) => {
  const isFinancial = type === Texts.FINANCIAL
  const graphData = controlFigs.map((fig, index) => ({
    ...fig,
    color: GraphColors[index]
  }))
  const [activeIndex, setActiveIndex] = useState(graphData.length > 1 ? graphData.findIndex((ele) => ele.value > 0) : 0)
  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  )

  return (
    <section>
      <ResponsiveContainer width='100%' height={400} className='marginGraph'>
        {allConsults === 0 || (type === Texts.FINANCIAL && required === 0) ? 
          <Alert
            className="alertPadding"
            text={`${type === Texts.FINANCIAL ? Texts.NO_INFO_FINANCIAL : Texts.NO_INFO }`}
            type="warning"
            noIcon
          />
        :
          <PieChart
            cx={70}
            cy={60}
          >
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={graphData}
              innerRadius={110}
              outerRadius={175}
              nameKey='name'
              dataKey='value'
              onMouseEnter={onPieEnter}>
              {graphData.map((values, index) => (<Cell key={`cell_standard_${values.name}_${index + 1}`} fill={values.color} />))}
            </Pie>
          </PieChart>
        }
      </ResponsiveContainer>
      <div className="dataSection">
        <Typography
          typo={`Total de ${isFinancial ? 'consultas' : 'firmas'}: ${formatNumber.format(allConsults)}`}
          classNames="shadowBoxAdd"
        />
        {isFinancial &&
          <Button
            type="button"
            variant="outline-primary"
            isLink
            classnames="buttonSample shadowBoxAdd"
            size="sm"
            onClickAnchor={() => required === 0 ? null : onClickAnchor({name:'Requeridas', value:required})}>
            Total de Muestra: {formatNumber.format(required)}
          </Button>
        }
      </div>
    </section>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload.length) {
    return (
      <div className={`customToolTipStyle ${payload[0].payload.color}Color`}>
        <Typography typo={<>
          {label}
          {(label !== 'Estatus Inicial' && label !== 'Caducado') &&
            <img className="imgReplaceSize" title={getIconPerStatus(label, true)} src={getIconPerStatus(label)} alt='iconStatus'/>
          }
        </>} variant="bold" />
        <Typography typo={payload[0].payload.text} />
        <Typography typo={`- ${payload[0].payload.date} -`} />
      </div>
    )
  }

  return null;
}

const CustomizedDot = (props: any) => {
  const { cx, cy, r, payload } = props;
  const color = payload.color;

  return (
    <circle cx={cx} cy={cy} r={r} strokeWidth={4} className={`${color}Color`}  />
  );
}

export const LineGraph = ({ data }: {
  data: {
    name: string;
    uv: number;
    text: string;
    date: string;
    color?: string;
  }[]
}) => {

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={600}
        height={400}
        data={data}
        margin={{
          top: 4,
          right: 4,
          left: 4,
          bottom: 4,
        }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis dataKey="name"/>
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ top: '-30px' }}/>
        <Line type='monotone' strokeOpacity={0.2} dataKey='uv' dot={<CustomizedDot />} activeDot={<CustomizedDot />}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

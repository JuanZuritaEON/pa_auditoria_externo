import { Consults, Fluxes, MassiveUpload, SpecialConsult, Typography } from '..'
import { Texts, ResultsProps } from '../../Redux'
import './Results.css'

const Results = (props: ResultsProps) => {
  const { actualTab, type } = props
  const title = (type === Texts.FINANCIAL && Texts.FIRST_TAB === actualTab) ? Texts.FINANCIAL_FIRST_TAB : actualTab
  const render = () => {
    switch (actualTab) {
      case Texts.FIRST_TAB: return <Consults />
      case Texts.MASSIVE_UPLOAD: return <MassiveUpload />
      case Texts.FLUXES_UPLOAD: return <Fluxes />
      case Texts.SPECIAL_REQUESTS: return <SpecialConsult />
    }
  }
  return (
    <article className='resultsContent'>
      <Typography typo={title} size='lg' variant='bold' classNames='resultTitle'/>
      {render()}
    </article>
  )
}

export default Results;
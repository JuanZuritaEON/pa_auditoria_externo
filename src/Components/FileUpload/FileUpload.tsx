import { Typography } from '..'
import { fileValidations } from '../../Utils'
import './FileUpload.css'

const FileUpload = (props: any) => {

  const {
    acceptedFiles,
    classNames,
    disabled,
    id,
    inputRef,
    isMultiple,
    label,
    maxSize,
    onChange,
  } = props

  const maxSizeMessage = maxSize ? `El tamaño máximo permitido es de ${maxSize}MB.` : ''

  const validateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = e.target.files
    let validFiles: File[] = []
    Array.from(files).forEach(file => {
      const validFile = fileValidations(file, maxSize, acceptedFiles)
      if (validFile) validFiles = [...validFiles, validFile]
    })
    if(validFiles.length === 0) {
      if (inputRef.current) inputRef.current.value = ''
      return 
    }
    onChange(validFiles)
  }

  return (
    <div className={`inputFileContainer ${classNames}`}>
      <input
        lang='en'
        type='file'
        accept={acceptedFiles}
        id={id}
        className='customFileUpload'
        onChange={validateFile}
        ref={inputRef}
        disabled={disabled}
        multiple={isMultiple}
      />
      <label className="inputCustomLabel" htmlFor={id}>
        {label}
      </label>
      <Typography
        typo={`*Elije un formato de archivo valido ( ${acceptedFiles.toString()} ). ${maxSizeMessage}`}
        classNames='inputCustomSubLabel'
        size='sm'
      />
    </div>
  )
}

export default FileUpload
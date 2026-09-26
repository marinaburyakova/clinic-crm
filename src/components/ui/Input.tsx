import styles from './Input.module.css'

type InputProps = {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'date'
  defaultValue?: string
  placeholder?: string
  required?: boolean
  error?: string
  autoComplete?: string
}

export default function Input({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  required,
  error,
  autoComplete,
}: InputProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  )
}
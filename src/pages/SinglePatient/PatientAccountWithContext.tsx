import { PatientAccountProvider } from './context/PatientAccountContext'
import PatientAccount from './PatientAccount'

export default function PatientAccountWithContext() {
  return (
    <div>
      <PatientAccountProvider>
        <PatientAccount />
      </PatientAccountProvider>
    </div>
  )
}

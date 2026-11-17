import ExportButton, {
  ExportButtonProps,
} from "../../../src/components/exportButton/ExportButtonV2";
import { AuthGuardPermissions } from "../core/AuthGuard";

type GLExportButtonProps = ExportButtonProps & { resource_key: string };

const GLExportButton = ({ resource_key, ...props }: GLExportButtonProps) => {
  return (
    <AuthGuardPermissions secureId={resource_key}>
      {({ disabled }) => <ExportButton {...props} disabled={disabled} />}
    </AuthGuardPermissions>
  );
};

export default GLExportButton;

import PageShell from "../components/PageShell";
import AccountPanel from "../components/AccountPanel";

export default function Register() {
  return (
    <PageShell backTo="/account" backLabel="Already have an account? Log in">
      <AccountPanel />
    </PageShell>
  );
}

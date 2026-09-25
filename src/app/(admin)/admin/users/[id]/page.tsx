import { UserDetail } from "@/features/admin/UserDetail";

export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  return <UserDetail id={id} />;
}

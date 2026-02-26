import prisma from "@/lib/prisma";
import { User, columns } from "./columns";
import { DataTable } from "./data-table";

const getData = async (): Promise<User[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      allowed: true,
    },
  });

  return users.map((u) => ({
    id: u.id,
    avatar: u.image || "/users/default.png", 
    status: "active",
    fullName: u.name || "Unnamed User",
    email: u.email || "No email",
    role: u.role,
  }));
};

const UsersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;

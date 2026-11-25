export async function requireCmsOwner() {
  const { getOwnerSession } = await import("./owner");
  const session = await getOwnerSession();
  return session;
}


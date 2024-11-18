import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  // Await the result of auth to get userId
  const { userId } = await auth();

  const transformation = transformationTypes[type];

  if (!userId) redirect("/sign-in");

  // Proceed with other logic, such as fetching user data
  const user = await getUserById(userId);

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Add" // Use "Add" for new transformations
          userId={user._id}
          creditBalance={user.creditBalance}
          type={type}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;

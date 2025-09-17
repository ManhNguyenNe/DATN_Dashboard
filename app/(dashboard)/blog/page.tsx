//import node modules libraries
import { Fragment, Suspense } from "react";
import { Metadata } from "next";

//import custom components
import BlogList from "components/blog/BlogList";
import BlogListHeader from "components/blog/BlogListHeader";
import Loading from "components/common/Loading";

export const metadata: Metadata = {
  title: "Post List | Dasher - Responsive Bootstrap 5 Admin Dashboard",
  description: "Dasher - Responsive Bootstrap 5 Admin Dashboard",
};

const Blog = () => {
  return (
    <Fragment>
      <BlogListHeader />
      <Suspense fallback={<Loading size="md" text="Đang tải danh sách bài viết..." />}>
        <BlogList />
      </Suspense>
    </Fragment>
  );
};

export default Blog;

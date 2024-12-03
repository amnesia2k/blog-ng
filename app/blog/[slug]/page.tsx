import Header from "@/app/components/Header";
import { Posts } from "../../lib/interface";
import { client, urlFor } from "../../lib/sanity";
import { Nunito } from "next/font/google";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { notFound } from "next/navigation";

const dateFont = Nunito({ weight: "400", subsets: ["latin"] });

async function getPost(slug: string) {
  const query = `
    *[_type == 'posts' && slug.current == "${slug}"] [0] {
      title,
      excerpt,
      publishedAt,
      slug,
      _id,
      body,
      tags[]-> {
        _id,
        slug,
        name
      },
      authors[]-> {
        _id,
        name
      }
    }
  `;

  const post = await client.fetch(query);
  return post;
}

export const revalidate = 30;

interface BlogProp {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogProp) {
  const resolvedParams = await params;
  const post: Posts = await getPost(resolvedParams?.slug);

  if (!post) {
    notFound();
  }
  
  return (
    <div>
      <Header title={post?.title} />

      <div className="text-center">
        <span className={`${dateFont?.className}`}>
          {new Date(post?.publishedAt).toDateString()}
        </span>

        <div className="mt-5 flex justify-center items-center gap-3">
          {post?.tags?.map((tag) => (
            <Link
              key={tag?._id}
              className="bg-green-500 px-3 py-1 rounded-full text-white text-xs lowercase"
              href={`/tag/${tag.slug.current}`}
            >
              # {tag?.name}
            </Link>
          ))}
        </div>

        <div className="text-left mt-5 mx-auto prose md:prose-lg dark:prose-invert prose-li:marker:text-primary">
          <PortableText
            value={post?.body}
            components={myPortableTextComponents}
          />
        </div>
      </div>
    </div>
  );
}

const myPortableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <Image
        src={urlFor(value).url()}
        className="border shadow-lg rounded-lg object-contain"
        alt="blog_image"
        width={700}
        height={700}
      />
    ),
  },
};
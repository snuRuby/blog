import { GetStaticProps, GetStaticPaths } from 'next';
import { Client } from '@notionhq/client';
import Layout from '../../components/Layout';
import BlogPost from '../../components/BlogPost';

interface Post {
  id: string;
  title: string;
  date: string;
  content: string;
  lang: 'ko' | 'en';
}

interface PostPageProps {
  post: Post;
}

export default function PostPage({ post }: PostPageProps) {
  return (
    <Layout>
      <BlogPost {...post} />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const fetchPosts = async (databaseId: string) => {
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    return response.results.map((page: any) => ({
      params: { id: page.id },
    }));
  };

  const koreanPosts = await fetchPosts(process.env.NOTION_DATABASE_ID_KO!);
  const englishPosts = await fetchPosts(process.env.NOTION_DATABASE_ID_EN!);

  return {
    paths: [...koreanPosts, ...englishPosts],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const id = params?.id as string;

  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const blocks = await notion.blocks.children.list({
      block_id: id,
    });

    const content = blocks.results
      .map((block: any) => {
        if (block.type === 'paragraph') {
          return block.paragraph.rich_text[0]?.plain_text || '';
        }
        return '';
      })
      .join('\n');

    // 데이터베이스 ID를 기반으로 언어 결정
    const isKorean = page.parent.database_id === process.env.NOTION_DATABASE_ID_KO;

    const post: Post = {
      id,
      title: (page as any).properties.이름.title[0].plain_text,
      date: (page as any).properties.날짜.date.start,
      content,
      lang: isKorean ? 'ko' : 'en',
    };

    return {
      props: {
        post,
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}; 
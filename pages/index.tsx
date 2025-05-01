import React from 'react';
import { GetStaticProps } from 'next';
import { Client } from '@notionhq/client';
import Layout from '../components/Layout';
import BlogPost from '../components/BlogPost';

interface Post {
  id: string;
  title: string;
  date: string;
  content: string;
  lang: 'ko' | 'en';
}

interface HomeProps {
  posts: Post[];
}

export default function Home({ posts }: HomeProps) {
  const koreanPosts = posts.filter(post => post.lang === 'ko');
  const englishPosts = posts.filter(post => post.lang === 'en');

  return (
    <Layout>
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">한글 블로그</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {koreanPosts.map((post) => (
              <div key={post.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <div className="text-gray-500 text-sm mb-4">
                    {new Date(post.date).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="prose line-clamp-3">
                    {post.content}
                  </div>
                  <a
                    href={`/posts/${post.id}`}
                    className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    더 읽기
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">English Blog</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {englishPosts.map((post) => (
              <div key={post.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <div className="text-gray-500 text-sm mb-4">
                    {new Date(post.date).toLocaleDateString('en-US')}
                  </div>
                  <div className="prose line-clamp-3">
                    {post.content}
                  </div>
                  <a
                    href={`/posts/${post.id}`}
                    className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Read more
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const fetchPosts = async (databaseId: string, lang: 'ko' | 'en') => {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: '날짜',
          direction: 'descending',
        },
      ],
    });

    return Promise.all(
      response.results.map(async (page: any) => {
        const pageContent = await notion.blocks.children.list({
          block_id: page.id,
        });

        return {
          id: page.id,
          title: page.properties.이름.title[0].plain_text,
          date: page.properties.날짜.date.start,
          content: pageContent.results
            .map((block: any) => {
              if (block.type === 'paragraph') {
                return block.paragraph.rich_text[0]?.plain_text || '';
              }
              return '';
            })
            .join('\n'),
          lang,
        };
      })
    );
  };

  try {
    const koreanPosts = await fetchPosts(process.env.NOTION_DATABASE_ID_KO!, 'ko');
    const englishPosts = await fetchPosts(process.env.NOTION_DATABASE_ID_EN!, 'en');

    return {
      props: {
        posts: [...koreanPosts, ...englishPosts],
      },
      revalidate: 60,
    };
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return {
      props: {
        posts: [],
      },
      revalidate: 60,
    };
  }
}; 
import React from 'react';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import Giscus from '@giscus/react';

interface BlogPostProps {
  title: string;
  date: string;
  content: string;
  lang: 'ko' | 'en';
}

export default function BlogPost({ title, date, content, lang }: BlogPostProps) {
  return (
    <article className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <time className="text-gray-500 mb-8 block">
          {format(new Date(date), 'PPP', { locale: lang === 'ko' ? ko : enUS })}
        </time>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      <div className="px-6 py-8 border-t">
        <h2 className="text-lg font-semibold mb-4">댓글</h2>
        <Giscus
          repo="[YOUR_GITHUB_USERNAME]/[YOUR_REPO_NAME]"
          repoId="[YOUR_REPO_ID]"
          category="Comments"
          categoryId="[YOUR_CATEGORY_ID]"
          mapping="pathname"
          term="Welcome to @giscus/react component!"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="light"
          lang={lang === 'ko' ? 'ko' : 'en'}
          loading="lazy"
        />
      </div>
    </article>
  );
} 
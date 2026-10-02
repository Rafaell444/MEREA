import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <p className="text-[80px] font-bold leading-none">404</p>
      <h1 className="mt-4 text-xl font-normal">Страница не найдена</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">Возможно, товар закончился или ссылка устарела. Загляни в новинки — там точно есть что-то для тебя.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary h-11 px-8 text-xsm">На главную</Link>
        <Link href="/kollektsiya/novinki-dlya-nee" className="btn-outline h-11 px-8 text-xsm">Новинки</Link>
      </div>
    </div>
  );
}

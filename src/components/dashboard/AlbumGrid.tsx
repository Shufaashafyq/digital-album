import { AlbumCard } from "./AlbumCard";

type Album = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  description: string | null;
  theme: string | null;
  isPublic: boolean;
  _count: {
    photos: number;
  };
};

type AlbumGridProps = {
  albums: Album[];
};

export function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <section>
      {/* Albums heading */}
      <div className="mb-7">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#552619" }}
        >
          Your Albums
        </h2>

        <p className="mt-1 text-sm text-[#8B665B]">
          Little collections holding your biggest memories.
        </p>
      </div>

      {/* Albums */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            id={album.id}
            title={album.title}
            slug={album.slug}
            photoCount={album._count.photos}
            coverImage={album.coverImage}
            description={album.description}
            theme={album.theme}
            isPublic={album.isPublic}
          />
        ))}
      </div>
    </section>
  );
}
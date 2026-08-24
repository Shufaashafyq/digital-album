import { prisma } from "@/lib/prisma";

export async function syncAlbumPages(albumId: string) {
  return prisma.$transaction(
    async (tx) => {
      
      const photos = await tx.photo.findMany({
        where: {
          albumId,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
        },
      });

      const existingPages =
        await tx.albumPage.findMany({
          where: {
            albumId,
          },
          orderBy: {
            pageOrder: "asc",
          },
          select: {
            id: true,
            pageOrder: true,
            layout: true,
          },
        });

      await tx.photo.updateMany({
        where: {
          albumId,
        },
        data: {
          pageId: null,
        },
      });

      const pageGroups: {
        photoIds: string[];
        layout: string;
      }[] = [];

      let photoIndex = 0;
      let pageNumber = 1;

      while (photoIndex < photos.length) {
        const pattern = (pageNumber - 1) % 4;

        let count: number;
        let layout: string;

        if (pattern === 0) {
          count = 1;
          layout = "single";
        } else if (pattern === 1) {
          count = 2;
          layout = "collage";
        } else if (pattern === 2) {
          count = 1;
          layout = "journal";
        } else {
          count = 3;
          layout = "collage";
        }

        const group = photos.slice(
          photoIndex,
          photoIndex + count
        );

        pageGroups.push({
          photoIds: group.map(
            (photo) => photo.id
          ),
          layout,
        });

        photoIndex += group.length;
        pageNumber += 1;
      }

      const pages = [];

      for (
        let i = 0;
        i < pageGroups.length;
        i++
      ) {
        const group = pageGroups[i];

        let page;

        if (existingPages[i]) {
          
          page = await tx.albumPage.update({
            where: {
              id: existingPages[i].id,
            },
            data: {
              pageOrder: i + 1,
              layout: group.layout,
            },
          });
        } else {
          
          page = await tx.albumPage.create({
            data: {
              albumId,
              pageOrder: i + 1,
              layout: group.layout,
            },
          });
        }

        pages.push(page);

        for (
          let photoIndex = 0;
          photoIndex < group.photoIds.length;
          photoIndex++
        ) {
          await tx.photo.update({
            where: {
              id: group.photoIds[photoIndex],
            },
            data: {
              pageId: page.id,
              zIndex: photoIndex,
            },
          });
        }
      }

      const pagesToDelete =
        existingPages.slice(pageGroups.length);

      if (pagesToDelete.length > 0) {
        await tx.albumPage.deleteMany({
          where: {
            id: {
              in: pagesToDelete.map(
                (page) => page.id
              ),
            },
          },
        });
      }

      return tx.albumPage.findMany({
        where: {
          albumId,
        },
        orderBy: {
          pageOrder: "asc",
        },
        include: {
          photos: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    },
    {
      timeout: 15000,
    }
  );
}
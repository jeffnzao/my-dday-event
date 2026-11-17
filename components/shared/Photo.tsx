import Image from "next/image";
import type { EditorialImage } from "@/lib/data";

type PhotoProps = {
  image: EditorialImage;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function Photo({ image, className = "", priority = false, sizes = "100vw" }: PhotoProps) {
  const isExternal = image.src.startsWith("https://") && !image.src.startsWith("https://images.unsplash.com/");
  return (
    <div
      className={`photo-frame ${className}`}
      role="img"
      aria-label={image.alt}
    >
      {isExternal ? (
        <img
          alt=""
          className="external-editorial-image"
          loading={priority ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          src={image.src}
          style={{ objectPosition: image.position ?? "center" }}
        />
      ) : (
        <Image
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          src={image.src}
          style={{ objectPosition: image.position ?? "center" }}
        />
      )}
    </div>
  );
}

import type { SpaceDto } from "@/services/types/pomodoro.types";

interface Props {
  space: SpaceDto | null;
}

const SpaceBackground = ({ space }: Props) => {
  if (!space) {
    return (
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.32 0.06 260) 0%, oklch(0.18 0.04 260) 60%, oklch(0.12 0.03 260) 100%)",
        }}
      />
    );
  }

  if (space.assetType === "VIDEO") {
    return (
      <video
        key={space.id}
        className="absolute inset-0 -z-10 w-full h-full object-cover"
        src={space.assetUrl}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <div
      key={space.id}
      className="absolute inset-0 -z-10 w-full h-full"
      style={{
        backgroundImage: `url("${space.assetUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};

export default SpaceBackground;

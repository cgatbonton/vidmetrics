export function HeroVideo() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover opacity-20"
      >
        <source src="/Hero Video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-[#010101]/60 via-transparent to-[#010101] pointer-events-none" />
    </div>
  );
}

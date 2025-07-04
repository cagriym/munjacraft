"use client";
import { useRef, useEffect } from "react";

const features = [
  {
    icon: "🛡️",
    title: "Güvenlik",
    desc: "Tüm üyeler ve verileriniz güvenle korunur.",
  },
  {
    icon: "💬",
    title: "Mesajlaşma Sistemi",
    desc: "Gerçek zamanlı, hızlı ve güvenli sohbet.",
  },
  {
    icon: "👥",
    title: "Topluluk",
    desc: "Aktif mesajlaşma ve topluluk etkileşimi.",
  },
  {
    icon: "⭐",
    title: "Özel Ranklar",
    desc: "Kendine özel rütbeler ve ayrıcalıklar.",
  },
  {
    icon: "🛠️",
    title: "Kişiselleştirme",
    desc: "Profilini dilediğin gibi düzenle ve öne çık.",
  },
];

export default function FeatureSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    let animation: number;
    let start = 0;
    const speed = 1; // px/frame

    function animate() {
      start -= speed;
      if (!slider) return;
      if (Math.abs(start) >= slider.scrollWidth / 2) {
        start = 0;
      }
      slider.style.transform = `translateX(${start}px)`;
      animation = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animation);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-[#111827] py-8">
      <div
        ref={sliderRef}
        className="flex gap-8"
        style={{
          width: "max-content",
          willChange: "transform",
        }}
      >
        {[...features, ...features].map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center min-w-[260px] h-40 bg-[#181f2a] rounded-xl shadow border border-gray-700 text-white px-8"
            style={{ opacity: 0.95 }}
          >
            <div className="text-4xl mb-2">{f.icon}</div>
            <div className="font-bold text-lg">{f.title}</div>
            <div className="text-sm text-gray-300 text-center">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

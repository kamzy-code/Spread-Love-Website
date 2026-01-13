'use client'
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {

  Play,
  Pause,

} from "lucide-react";

function ExperienceMagic() {

      const samples = [
    {
      video: "/call-samples/birthday.mp4",
      title: "Birthday Call",
      description: "A heartfelt birthday surprise for your loved one.",
    },
    {
      video: "/call-samples/appreciation.mp4",
      title: "Appreciation Call",
      description: "Celebrate love with a special anniversary message.",
    },
    {
      video: "/call-samples/celebration.mp4",
      title: "Celebration Call",
      description: "Cherish your friendship with a surprise call.",
    },
  ];

    
      const [playingVid, setPlayingVid] = useState<number | null>(null);
      const videoRefs = [
        useRef<HTMLVideoElement>(null),
        useRef<HTMLVideoElement>(null),
        useRef<HTMLVideoElement>(null),
      ];
    

  return (
      <section
        id="sample-section"
        className="flex flex-col items-center justify-center gap-4 py-20 text-center section-padding gradient-background-soft"
      >
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text pb-4 ">
          Experience the Magic
        </h1>
        <p className="text-md sm:text-xl  text-gray-700 ">
          Listen to real call samples and see how we create magical moments
        </p>

        <div className="flex flex-wrap gap-12 items-center justify-center section-padding mt-10">
          {samples.map((sample, index) => {
            return (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center card "
              >
                <video
                  ref={videoRefs[index]}
                  className="rounded-t-lg  h-50 w-70 sm:h-60 sm:w-80 object-cover "
                >
                  <source src={sample.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <div className="flex flex-row items-center justify-center py-4 hover:scale-105  transition-transform duration-300">
                  {playingVid === index ? (
                    <Pause
                      className="h-8 w-8 text-brand-end"
                      onClick={() => {
                        if (videoRefs[index].current) {
                          videoRefs[index].current.pause();
                          setPlayingVid(null);
                        }
                      }}
                    />
                  ) : (
                    <Play
                      className="h-8 w-8 text-brand-end"
                      onClick={() => {
                        if (videoRefs[index].current) {
                          videoRefs.forEach((videoRef, i) => {
                            if (videoRef.current && i !== index)
                              videoRef.current.pause();
                          });
                          videoRefs[index].current.play();
                          setPlayingVid(index);
                        }
                      }}
                    />
                  )}
                  <h2 className="text-xl md:text-2xl font-semibold text-brand-start">
                    {sample.title}
                  </h2>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
  )
}

export default ExperienceMagic;
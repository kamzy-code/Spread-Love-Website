import {motion} from "framer-motion";
import { MessageCircle } from "lucide-react";

function GetInTouch () {
 return (
    <section className="gradient-background">
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container-max section-padding flex flex-col justify-center items-center text-center gap-4 py-20"
      >
        <MessageCircle className="h-16 w-16 text-white"></MessageCircle>
        <h1 className="text-white text-5xl md:text-6xl font-bold">
          {" "}
          Get in Touch
        </h1>
        <p className="text-primary-200 text-lg md:text-xl max-w-[80%] lg:max-w-[60%]">
          {`Have questions? Need help? We're here to make your experience perfect.`}
        </p>
      </motion.div>
    </section>
 )
}

export default GetInTouch;
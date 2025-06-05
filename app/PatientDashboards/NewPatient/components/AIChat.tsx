import ChatBotImage from "@/public/bg/chatbotbg.png";

export default function AIChat() {
  return (
    <div
      className="relative mx-auto mt-20 rounded-3xl overflow-hidden shadow-2xl"
      style={{
        backgroundImage: `url(${ChatBotImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "700px",
        height: "400px",
      }}
    >
      <div className="absolute inset-0 bg-transparent px-12 py-12 flex items-start justify-between gap-12">
        {/* Left Column */}
        <div className="flex flex-col w-1/2 relative">
          {/* Bot and bubble at the top */}
          <div className="relative bg-[#1E3CA7] text-white text-lg px-6 py-4 rounded-2xl shadow-xl w-fit">
            Hi! <br /> Need help today?

            {/* Triangle tail */}
            <div
              className="absolute bottom-[-10px] right-4 w-0 h-0 border-l-[10px] border-l-transparent 
              border-t-[10px] border-t-[#1E3CA7] border-r-[10px] border-r-transparent"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center w-1/2">
          <h3 className="text-3xl font-bold mt-12 mb-4 text-center text-heading">Meet Your Friendly AI Helper</h3>
          <p className="text-base mb-6 text-center text-heading2">
            I’m here to help you anytime. Let’s chat!
          </p>
          <button className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90">
            Try Chat Now
          </button>
        </div>
      </div>
    </div>
  );
}

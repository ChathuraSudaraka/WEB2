import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [hoveredSide, setHoveredSide] = useState(null);

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      {/* Split Screen Layout - Exactly like Zeus with dynamic sizing */}
      <div className="flex h-full">
        {/* Male Section */}
        <Link
          to="/products?category=men"
          className="relative group cursor-pointer overflow-hidden transition-all duration-1000 ease-out"
          style={{
            flex:
              hoveredSide === "male"
                ? "0 0 65%"
                : hoveredSide === "female"
                ? "0 0 35%"
                : "0 0 50%",
          }}
          onMouseEnter={() => setHoveredSide("male")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/20755907/pexels-photo-20755907.jpeg')`,
              transform: hoveredSide === "male" ? "scale(1.05)" : "scale(1)",
              filter: hoveredSide === "male" ? "blur(8px)" : "blur(0px)",
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

          {/* Content */}
          <div className="relative z-10 flex items-end justify-start h-full p-8">
            <div className="text-left text-white">
              {/* Zeus-style layout when expanded */}
              {hoveredSide === "male" ? (
                <div className="flex items-center justify-center h-screen w-full absolute inset-0">
                  {/* Main categories like Zeus - Vertical Column Layout */}
                  <div className="flex flex-col items-center justify-center space-y-8">
                    <h3 className="text-5xl font-bold tracking-wide opacity-0 transform translate-y-4 animate-fade-up transition-all duration-700" style={{animationDelay: '0.1s'}}>
                      Body
                    </h3>

                    {/* Featured category with Zeus-style pill button */}
                    <div className="flex justify-center transform translate-y-4 opacity-0 animate-fade-up" style={{animationDelay: '0.3s'}}>
                      <button className="px-10 py-4 border-3 border-orange-400 text-orange-400 rounded-full text-2xl font-bold tracking-wide hover:bg-orange-400 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                        Skin
                      </button>
                    </div>

                    <h3 className="text-5xl font-bold tracking-wide opacity-0 transform translate-y-4 animate-fade-up transition-all duration-700" style={{animationDelay: '0.5s'}}>
                      Hair
                    </h3>
                    <h3 className="text-5xl font-bold tracking-wide opacity-0 transform translate-y-4 animate-fade-up transition-all duration-700" style={{animationDelay: '0.7s'}}>
                      TRT
                    </h3>

                    {/* Shop Button - Below other elements */}
                    <div className="transform translate-y-6 opacity-0 animate-fade-up" style={{animationDelay: '0.9s'}}>
                      <button className="inline-block px-12 py-5 border-3 border-white text-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 text-xl font-bold tracking-wider uppercase cursor-pointer">
                        Shop Male
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2
                    className={`font-semibold tracking-[0em] transition-all duration-1000 ${
                      hoveredSide === "male"
                        ? "text-3xl md:text-4xl"
                        : "text-2xl md:text-5xl"
                    }`}
                    style={{
                      textShadow:
                        hoveredSide === "male"
                          ? "0 0 30px rgba(255,255,255,0.3), 2px 2px 20px rgba(0,0,0,0.8)"
                          : "2px 2px 20px rgba(0,0,0,0.8)",
                      transform:
                        hoveredSide === "male"
                          ? "translateY(-10px)"
                          : "translateY(0)",
                    }}
                  >
                    Male
                  </h2>

                  {/* Animated underline */}
                  <div
                    className="mx-auto bg-white transition-all duration-1000 mt-6"
                    style={{
                      width: hoveredSide === "male" ? "100px" : "0px",
                      height: "2px",
                      opacity: hoveredSide === "male" ? 1 : 0,
                      boxShadow:
                        hoveredSide === "male"
                          ? "0 0 20px rgba(255,255,255,0.5)"
                          : "none",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hover overlay effect */}
          <div
            className={`absolute inset-0 transition-all duration-1000 ${
              hoveredSide === "male" ? "bg-black/50" : hoveredSide === "female"
            }`}
          />
        </Link>

        {/* Female Section */}
        <Link
          to="/products?category=women"
          className="relative group cursor-pointer overflow-hidden transition-all duration-1000 ease-out"
          style={{
            flex:
              hoveredSide === "female"
                ? "0 0 65%"
                : hoveredSide === "male"
                ? "0 0 35%"
                : "0 0 50%",
          }}
          onMouseEnter={() => setHoveredSide("female")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=1600&fit=crop')`,
              transform: hoveredSide === "female" ? "scale(1.05)" : "scale(1)",
              filter: hoveredSide === "female" ? "blur(8px)" : "blur(0px)",
            }}
          />

          {/* Gradient Overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-black/20" /> */}

          {/* Content */}
          <div className="relative z-10 flex items-end justify-end h-full p-8">
            <div className="text-right text-white">
              {/* Zeus-style layout when expanded */}
              {hoveredSide === "female" ? (
                <div className="flex items-center justify-center h-screen w-full absolute inset-0">
                  {/* Main categories like Zeus - Vertical Column Layout */}
                  <div className="flex flex-col items-center justify-center space-y-8">
                    <h3 className="text-5xl font-bold tracking-wide opacity-0 transform translate-y-4 animate-fade-up transition-all duration-700" style={{animationDelay: '0.1s'}}>
                      Body
                    </h3>

                    {/* Featured category with Zeus-style pill button */}
                    <div className="flex justify-center transform translate-y-4 opacity-0 animate-fade-up" style={{animationDelay: '0.3s'}}>
                      <button className="px-10 py-4 border-3 border-pink-400 text-pink-400 rounded-full text-2xl font-bold tracking-wide hover:bg-pink-400 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer">
                        Skin
                      </button>
                    </div>

                    <h3 className="text-5xl font-bold tracking-wide opacity-0 transform translate-y-4 animate-fade-up transition-all duration-700" style={{animationDelay: '0.5s'}}>
                      Hair
                    </h3>
                    <h3 className="text-5xl font-bold tracking-wide opacity-0 transform translate-y-4 animate-fade-up transition-all duration-700" style={{animationDelay: '0.7s'}}>
                      Beauty
                    </h3>

                    {/* Shop Button - Below other elements */}
                    <div className="transform translate-y-6 opacity-0 animate-fade-up" style={{animationDelay: '0.9s'}}>
                      <button className="inline-block px-12 py-5 border-3 border-white text-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 text-xl font-bold tracking-wider uppercase cursor-pointer">
                        Shop Female
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2
                    className={`font-semibold tracking-[0em] transition-all duration-1000 ${
                      hoveredSide === "female"
                        ? "text-3xl md:text-4xl"
                        : "text-2xl md:text-5xl"
                    }`}
                    style={{
                      textShadow:
                        hoveredSide === "female"
                          ? "0 0 30px rgba(255,255,255,0.3), 2px 2px 20px rgba(0,0,0,0.8)"
                          : "2px 2px 20px rgba(0,0,0,0.8)",
                      transform:
                        hoveredSide === "female"
                          ? "translateY(-10px)"
                          : "translateY(0)",
                    }}
                  >
                    Female
                  </h2>

                  {/* Animated underline */}
                  <div
                    className="mx-auto bg-white transition-all duration-1000 mt-6"
                    style={{
                      width: hoveredSide === "female" ? "100px" : "0px",
                      height: "2px",
                      opacity: hoveredSide === "female" ? 1 : 0,
                      boxShadow:
                        hoveredSide === "female"
                          ? "0 0 20px rgba(255,255,255,0.5)"
                          : "none",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hover overlay effect */}
          <div
            className={`absolute inset-0 transition-all duration-1000 ${
              hoveredSide === "female" ? "bg-black/50" : hoveredSide === "male"
            }`}
          />
        </Link>
      </div>
    </div>
  );
};

export default Home;

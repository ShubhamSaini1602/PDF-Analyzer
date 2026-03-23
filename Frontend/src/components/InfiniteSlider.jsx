// Import Core Components
import {Swiper, SwiperSlide} from "swiper/react";
// Import Additional Components you need in your project
import {Autoplay} from "swiper/modules";

// Import this base CSS (mandatory)
import "swiper/css";

// Import additional components' css as well if any
// ----------Nothing for now-----------------------

// Import Images
import rightArrowImg from "../assets/right-arrow.png";

function InfiniteSlider(){
    
    return (
        <>
        <div className="last-marquee">
            <Swiper
            modules={[Autoplay]}
            slidesPerView={"auto"}
            spaceBetween={50}
            loop={true}
            speed={6500}
            autoplay={{
                delay:0,
                disableOnInteraction: false,
                reverseDirection: true
            }}
            allowTouchMove={false}
            >
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text1">HAPPY CODING</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text2">Happy Coding</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text1">HAPPY CODING</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text2">Happy Coding</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text1">HAPPY CODING</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text2">Happy Coding</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text1">HAPPY CODING</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text2">Happy Coding</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text1">HAPPY CODING</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="content">
                    <h1 className="swiper-text2">Happy Coding</h1>
                    <img src={rightArrowImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            </Swiper>
        </div>
        </>
    );
}

export default InfiniteSlider;





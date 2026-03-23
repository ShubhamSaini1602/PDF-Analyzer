import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay} from "swiper/modules";

import "swiper/css";

// Import All Images
import googleImg from "../assets/google.png";
import amazonImg from "../assets/amazon.png";
import oracleImg from "../assets/oracle.png";
import salesforceImg from "../assets/salesforce.png";
import facebookImg from "../assets/facebook.png";
import netflixImg from "../assets/netflix.png";
import ciscoImg from "../assets/cisco.png";
import adobeImg from "../assets/adobe.png";
import spotifyImg from "../assets/spotify.png";
import dellImg from "../assets/dell.png";
import intelImg from "../assets/intel.png";
import nvidiaImg from "../assets/nvidia.png";
import flipkartImg from "../assets/flipkart.png";
import zomatoImg from "../assets/zomato.png";


function Marquee(){
    return (
        <>
        <div>
            <p className="marquee-text">Trusted by developers and interview preppers from:</p>
        </div>
        <div className="company">
            <Swiper
            modules={[Autoplay]}
            spaceBetween={150}
            slidesPerView={"auto"}
            loop={true}
            speed={2500}
            autoplay={{
                delay:0,
                disableOnInteraction:false,
                reverseDirection:true
            }}
            allowTouchMove={false}
            >
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={googleImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={amazonImg} className="swiper-img amazon"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={oracleImg} className="swiper-img oracle"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={salesforceImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={facebookImg} className="swiper-img facebook"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={netflixImg} className="swiper-img"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={ciscoImg} className="swiper-img cisco"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={adobeImg} className="swiper-img adobe"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={spotifyImg} className="swiper-img spotify"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={dellImg} className="swiper-img dell"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={intelImg} className="swiper-img intel"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={nvidiaImg} className="swiper-img nvidia"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={flipkartImg} className="swiper-img flipkart"></img>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="swiper-content">
                    <img src={zomatoImg} className="swiper-img zomato"></img>
                </div>
            </SwiperSlide>
            </Swiper>
        </div>
        </>
    )
}

export default Marquee;
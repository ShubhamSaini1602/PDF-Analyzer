import { useState } from 'react';
import { Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import ProfileMenu from "./ProfileMenu";
import Aurora from "./Aurora";
import PremiumFAQ from './PremiumFAQ';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';
import { updateUser } from '../CentralStore/authSlice';
import Footer from "./Footer";
import logoImg from "../assets/Logo.png";
import subscriptionVideo from "../assets/subscription.mp4";

const tiers = [
    {
        id: 'free',
        name: 'Starter',
        description: 'Perfect for learning and basic practice',
        monthlyPrice: 0,
        yearlyPrice: 0,
        icon: 'ri-seedling-fill',
        features: [
            'Access to 50+ Basic Problems',
            'Standard Code Editor',
            'Company-wise Problem Filter',
            'Public Profile',
            'Basic Compilation Speed',
        ],
        cta: 'Current Plan',
        color: 'emerald',
    },
    {
        id: 'pro',
        name: 'Pro Master',
        description: 'For serious coders preparing for interviews',
        monthlyPrice: 499,
        yearlyPrice: 4999, // ~17% savings
        icon: 'ri-fire-fill',
        popular: true,
        features: [
            'Unlimited Access to All Problems',
            'Detailed Video Solutions',
            'Orion AI Assistant (Unlimited)',
            'Premium Debugging Tools',
            'Personal Notes & Bookmarks',
            '10x Faster Execution',
            'AI Interview Simulator',
        ],
        cta: 'Upgrade to Pro',
        color: 'blue',
    },
    {
        id: 'team',
        name: 'Team / Campus',
        description: 'For colleges and coding clubs',
        monthlyPrice: 9999,
        yearlyPrice: 99999,
        icon: 'ri-building-3-fill',
        features: [
            'Everything Included in Pro Master',
            'Admin Dashboard & Controls',
            'Bulk Student & Member Management',
            'Contest & Assessment Creation Tools',
            'Performance & Progress Analytics',
            'Dedicated Account Support',
            'Custom SSO & LMS Integration',
        ],
        cta: 'Request Campus Access',
        color: 'amber',
    },
];

function PricingPage(){
    const [billingCycle, setBillingCycle] = useState('monthly');
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Helper Function to Load Razorpay Script Dynamically in index.html
    function loadRazorpayScript(){
        return new Promise((resolve) => {
            // First, it creates a <script></script> tag in memory
            const script = document.createElement("script");
            // Then, it sets this link in the script's src:
            // <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            // This link tells the browser where to fetch the Razorpay code from
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            // If the code is fetched successfully, return true
            script.onload = () => {
                resolve(true);
            };
            // If some error occurs, such as the internet being disconnected, return false
            script.onerror = () => {
                resolve(false);
            };
            // Then, we inject this script tag from memory into the index.html page,
            // and the Razorpay script gets loaded dynamically
            document.body.appendChild(script);
        });
    };

    async function handleSubscribe(tierName, price){
        // Basic Validation
        if (!user) {
            toast.error("Please login to upgrade!");
            navigate('/login');
            return;
        }
        // If the user clicks on the Current Plan button, no action is required.
        if (price === 0) {
            toast.success("You are already on the Free plan!");
            return;
        }

        const loadingToast = toast.loading("Initializing secure payment...");

        try {
            // Load Razorpay Script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.dismiss(loadingToast);
                toast.error("Failed to load payment gateway. Check internet.");
                return;
            }

            const response = await axiosClient.post("/payment/create-order",
                {
                    planType: billingCycle,
                    amount: price
                }
            );
            const data = response.data;

            if (!data.success) {
                throw new Error("Order creation failed");
            }

            toast.dismiss(loadingToast);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // PUBLIC KEY from .env
                amount: data.order.amount,
                currency: "INR",
                name: "ByteRank",
                description: `Premium Subscription - ${billingCycle}`,
                image: "https://res.cloudinary.com/ds3xo9dgm/image/upload/v1768049534/Logo_fqfzfd.png",
                order_id: data.order.id,
                
                // The Success Handler (Triggered on Payment Success)
                handler: async function (response) {
                    const verifyToast = toast.loading("Verifying payment...");
                    
                    try {
                        // Call Backend to Verify Payment
                        const verifyRes = await axiosClient.post("/payment/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyRes.data.success) {
                            toast.dismiss(verifyToast);
                            toast.success("Welcome to Premium!");
                            // Now the whole app knows this user is Premium!
                            if (verifyRes.data.user) {
                                dispatch(updateUser(verifyRes.data.user));
                            }
                            // Redirect to Success Page
                            navigate('/payment-success',{
                                state:{
                                    tier_name: tierName,
                                    payment_id: verifyRes.data.payment_id
                                }
                            });
                        }
                    } 
                    catch (error) {
                        toast.dismiss(verifyToast);
                        toast.error("Payment Verification Failed. Contact Support.");
                        console.log(error);
                    }
                },
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.emailId,
                    contact: "9999999999",
                },
                theme: {
                    color: "#3b82f6",
                },
                // Handling Modal Close
                modal: {
                    ondismiss: function() {
                        toast("Payment Cancelled");
                    }
                }
            };

            // Open the Payment Screen
            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } 
        catch (error) {
            toast.dismiss(loadingToast);
            console.log("Payment Error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <>
        <Aurora
            colorStops={["#3730a3", "#86198f", "#155e75"]}
            blend={1}
            amplitude={1}
            speed={0.5}
        />

        <div className="navbar">
            <img src={logoImg} className="logo"></img>
            <div className="navbar-2">
                <div className="div1 extra-div-1">
                    <i className="ri-home-7-fill home-icon"></i>
                    <Link to="/">
                        <button className="btn">Home</button>
                    </Link>
                </div>
                <div className="div1">
                    <i className="ri-code-box-fill problem-icon"></i>
                    <Link to="/problems">
                        <button className="btn">Problems</button>
                    </Link>
                </div>
                <div className="div1 extra-div-2">
                    <i className="ri-phone-fill call-icon"></i>
                    <Link to="/contact">
                        <button className="btn">Contact Us</button>
                    </Link>
                </div>
            </div>
            <div className="profile-menu-div">
                {user?.role==="admin" ? (
                    <Link to="/adminPanel">
                        <button className="admin-btn">Admin Panel</button>
                    </Link>
                ) : (
                    <ProfileMenu/>
                )}
            </div>
            <button className="premium-features" onClick={() => navigate("/")}>
                <i className="ri-arrow-left-circle-line back-icon-2"></i>
                Back
            </button>
        </div>

        {/* --- Header Section --- */}
        <div className="pricing-header">
            <img src="/subs-pic1.png" className='subs-pic1'></img>
            <div className="pricing-badge">
                <i className="ri-flashlight-fill"></i>
                <span>Premium Plans</span>
            </div>
            <div className='pricing-title-and-video-div'>
                <h1 className="pricing-title">Invest in your<span className="pricing-title-gradient"> Coding Career</span></h1>
                <video height="100" autoPlay muted loop className='subs-video'>
                    <source src={subscriptionVideo} type="video/mp4"></source>
                    Your Browser does not support the video element
                </video>
            </div>
            <p className="pricing-subtitle">Unlock the tools you need to crack FAANG interviews - Video solutions, AI debugging, and more.</p>

            {/* --- Billing Toggle --- */}
            <div className="billing-toggle-container">
                <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
                <button
                    className="billing-toggle"
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    aria-label="Toggle billing cycle"
                >
                    <span className={`toggle-slider-2 ${billingCycle === 'yearly' ? 'yearly' : ''}`} />
                </button>
                <span className={billingCycle === 'yearly' ? 'active' : ''}>Yearly</span>
                <span className="savings-badge-10">Save ~20%</span>
            </div>
            <img src="/subs-pic2.png" className='subs-pic2'></img>
        </div>

        {/* --- Pricing Cards --- */}
        <div className="pricing-grid">
            {tiers.map((tier, index) => {
                const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
          
            return (
                <div
                    key={tier.name}
                    className={`pricing-card ${tier.popular ? 'popular' : ''} ${tier.color}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {tier.popular && (
                        <div className="popular-badge">
                            <i className="ri-star-fill" style={{marginRight:'5px'}}></i>
                            Most Popular
                        </div>
                    )}

                    <div className="card-header">
                        <div className={`icon-container ${tier.color}`}>
                            <i className={tier.icon}></i>
                        </div>
                        <h3 className="tier-name">{tier.name}</h3>
                        <p className="tier-description">{tier.description}</p>
                    </div>

                    <div className="price-container">
                        <div className="price-wrapper">
                            <span className="currency">₹</span>
                            <span className="price">{price}</span>
                            <span className="period">{price === 0 ? '' : `/${billingCycle === 'monthly' ? 'month' : 'yr'}`}</span>
                        </div>
                    </div>

                    <button 
                        className={`cta-button ${tier.color} ${tier.popular ? 'popular' : ''}`}
                        onClick={() => handleSubscribe(tier.name, price)}
                    >
                        {tier.cta}
                        <span className="button-shine" />
                    </button>

                    <div className="features-list">
                        <div className="features-header">
                            <i className="ri-shield-check-line" style={{marginRight:'8px'}}></i>
                            <span>What's included:</span>
                        </div>
                        {tier.features.map((feature, idx) => (
                            <div key={idx} className="feature-item">
                                <div className={`check-icon ${tier.color}`}>
                                    <i className="ri-check-line"></i>
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
                );
            })}
        </div>

        <PremiumFAQ/>

        <Footer/>
        </>
    );
};

export default PricingPage;
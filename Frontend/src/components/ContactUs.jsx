import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast'; 
import { contactUs } from '../CentralStore/authSlice';
import FloatingLines from './FloatingLines';
import customerSupportVideo from "../assets/customer-support-video.mp4";

function ContactUs() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, contactLoading } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: user ? `${user.firstName} ${user.lastName}` : "",
            email: user ? user.emailId : "",
            subject: "",
            message: ""
        }
    });

    const onSubmit = (data) => {
        const loadingToast = toast.loading("Sending your message...");

        dispatch(contactUs(data))
            .unwrap()
            .then((successMessage) => {
                // Dismiss loading toast
                toast.dismiss(loadingToast);
                // Redirect to Premium Page
                navigate('/premium');
                // Show Success Toast
                toast.success(successMessage || "Message sent successfully! We will contact you shortly.");
            })
            .catch((err) => {
                // Dismiss loading toast
                toast.dismiss(loadingToast);
                // Show Error Toast
                toast.error(err || "Failed to send message. Please try again.");
            });
    };

    return (
        <div className="contact-container">
            <div className='floating-lines-container'>
                <FloatingLines
                    lineCount={8}
                />
            </div>
            <div className="contact-wrapper">
                {/* Left Side: Contact Info */}
                <div className="contact-info">
                    <video height="600" autoPlay muted loop className='customer-support-video'>
                        <source src={customerSupportVideo} type="video/mp4"></source>
                        Your Browser does not support the video element
                    </video>
                </div>

                {/* Right Side: Form */}
                <div className="contact-form-section">
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
                        
                        <div className="contact-form-group">
                            <label className="contact-form-label">Name</label>
                            <input 
                                type="text" 
                                className={`contact-form-input ${errors.name ? 'error' : ''}`}
                                placeholder="John Doe"
                                {...register("name", { required: "Name is required" })}
                            />
                            {errors.name && <span className="contact-error-msg"><i className="ri-error-warning-fill"></i> {errors.name.message}</span>}
                        </div>

                        <div className="contact-form-group">
                            <label className="contact-form-label">Email</label>
                            <input 
                                type="email" 
                                className={`contact-form-input ${errors.email ? 'error' : ''}`}
                                placeholder="john@example.com"
                                {...register("email", { 
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.email && <span className="contact-error-msg"><i className="ri-error-warning-fill"></i> {errors.email.message}</span>}
                        </div>

                        <div className="contact-form-group">
                            <label className="contact-form-label">Subject</label>
                            <select 
                                className={`contact-form-input ${errors.subject ? 'error' : ''}`}
                                {...register("subject", { required: "Please select a topic" })}
                            >
                                <option value="">Select a topic</option>
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Bug Report">Bug Report</option>
                                <option value="Feature Request">Feature Request</option>
                                <option value="Premium Subscription">Premium Subscription</option>
                            </select>
                            {errors.subject && <span className="contact-error-msg"><i className="ri-error-warning-fill"></i> {errors.subject.message}</span>}
                        </div>

                        <div className="contact-form-group">
                            <label className="contact-form-label">Message</label>
                            <textarea 
                                className={`contact-form-textarea ${errors.message ? 'error' : ''}`}
                                placeholder="Tell us how we can help..."
                                {...register("message", { 
                                    required: "Message is required",
                                    minLength: { value: 10, message: "Message must be at least 10 characters" }
                                })}
                            ></textarea>
                            {errors.message && <span className="contact-error-msg"><i className="ri-error-warning-fill"></i> {errors.message.message}</span>}
                        </div>

                        <button type="submit" className="contact-submit-btn" disabled={contactLoading}>
                            {contactLoading ? (
                                <>
                                    <div className="contact-btn-spinner"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send Message <i className="ri-send-plane-fill"></i>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;
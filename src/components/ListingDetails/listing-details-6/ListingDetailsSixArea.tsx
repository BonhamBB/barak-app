"use client"
import AgencyFormOne from "@/components/forms/AgencyFormOne"
import MediaGallery from "../listing-details-1/MediaGallery"
import SimilarProperty from "../listing-details-4/SimilarProperty"
import CommonAmenities from "../listing-details-common/CommonAmenities"
import CommonBanner from "../listing-details-common/CommonBanner"
import CommonLocation from "../listing-details-common/CommonLocation"
import CommonNearbyList from "../listing-details-common/CommonNearbyList"
import CommonProPertyScore from "../listing-details-common/CommonProPertyScore"
import CommonPropertyFeatureList from "../listing-details-common/CommonPropertyFeatureList"
import CommonPropertyFloorPlan from "../listing-details-common/CommonPropertyFloorPlan"
import CommonPropertyVideoTour from "../listing-details-common/CommonPropertyVideoTour"
import FeatureListing from "../listing-details-sidebar.tsx/FeatureListing"
import ScheduleForm from "../listing-details-sidebar.tsx/ScheduleForm"
import SidebarInfo from "../listing-details-sidebar.tsx/SidebarInfo"
import Review from "@/components/inner-pages/agency/agency-details/Review"
import LoginModal from "@/modals/LoginModal"
import { useState, useMemo } from "react"
import NiceSelect from "@/ui/NiceSelect"
import { api } from "@/utils/api"
import { toast } from "react-toastify"

const ListingDetailsSixArea = () => {

   const selectHandler = (e: any) => { };

   const [loginModal, setLoginModal] = useState<boolean>(false);

   const [area, setArea] = useState(350);
   const [rentPerSqm, setRentPerSqm] = useState(120);
   const [mgmt, setMgmt] = useState(25);
   const [arnona, setArnona] = useState(34);
   const [cleaning, setCleaning] = useState(3);
   const [elec, setElec] = useState(8);
   const [parking, setParking] = useState(0);
   const [parkingPrice, setParkingPrice] = useState(450);
   const [grace, setGrace] = useState(0);
   const [months, setMonths] = useState(36);
   const [techDiscount, setTechDiscount] = useState(false);

   const { monthlyTotal, yearlyTotal, effectiveMonthly, perSqm } = useMemo(() => {
      const arnonaRate = techDiscount ? 0.65 : 1;
      const m = (rentPerSqm + mgmt + arnona * arnonaRate + cleaning + elec) * area + parking * parkingPrice;
      const y = m * 12;
      const eff = months > 0 ? (m * months - m * grace) / months : m;
      const ps = area > 0 ? Math.round(m / area) : 0;
      return { monthlyTotal: m, yearlyTotal: y, effectiveMonthly: eff, perSqm: ps };
   }, [area, rentPerSqm, mgmt, arnona, cleaning, elec, parking, parkingPrice, grace, months, techDiscount]);

   const handleSendInquiry = async () => {
      try {
         await api.post("/client-events", {
            slug: "listing_details_06",
            propertyId: null,
            action: "interest",
            timestamp: new Date().toISOString(),
         });
         toast.success("הבקשה נשלחה! ברק יצור איתך קשר בהקדם.");
      } catch {
         toast.error("שגיאה בשליחה. נסה שוב.");
      }
   };

   return (
      <>
         <div className="listing-details-one theme-details-one mt-200 xl-mt-150 pb-150 xl-mb-120">
            <div className="container">
               <CommonBanner style_3={true} tag="להשכרה" />
               <MediaGallery style={true} />
               <div className="row pt-80 lg-pt-50">
                  <div className="col-xl-8">
                     <div className="property-overview bottom-line-dark pb-40 mb-60">
                        <h4 className="mb-20">Overview</h4>
                        <p className="fs-20 lh-lg">Risk management and compliance, when approached strategically, have the
                           potential to go beyond mitigating threats and protecting a company’s operations &
                           reputation.They can actually generate value and create opportunities. </p>
                     </div>
                     <div className="property-feature-accordion bottom-line-dark pb-40 mb-60">
                        <h4 className="mb-20">Property Features</h4>
                        <p className="fs-20 lh-lg">Risk management and compliance, when approached strategically, have the
                           potential to go beyond mitigating threats.</p>

                        <div className="accordion-style-two grey-bg mt-45">
                           <CommonPropertyFeatureList />
                        </div>
                     </div>
                     <div className="property-amenities bottom-line-dark pb-40 mb-60">
                        <CommonAmenities />
                     </div>
                     <div className="property-video-tour bottom-line-dark pb-40 mb-60">
                        <CommonPropertyVideoTour />
                     </div>
                     <CommonPropertyFloorPlan style={true} />
                     <div className="property-nearby bottom-line-dark pb-40 mb-60">
                        <CommonNearbyList />
                     </div>
                     <SimilarProperty />
                     <div className="property-score bottom-line-dark pb-40 mb-60">
                        <CommonProPertyScore />
                     </div>

                     <div className="property-location bottom-line-dark pb-60 mb-60">
                        <h4 className="mb-40">Location</h4>
                        <div className="wrapper">
                           <div className="map-banner overflow-hidden">
                              <div className="gmap_canvas h-100 w-100">
                                 <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83088.3595592641!2d-105.54557276330914!3d39.29302101722867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x874014749b1856b7%3A0xc75483314990a7ff!2sColorado%2C%20USA!5e0!3m2!1sen!2sbd!4v1699764452737!5m2!1sen!2sbd"
                                    width="600" height="450" style={{ border: 0 }} allowFullScreen={true} loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade" className="w-100 h-100">
                                 </iframe>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="review-panel-one bottom-line-dark pb-40 mb-60">
                        <div className="position-relative z-1">
                           <div className="d-sm-flex justify-content-between align-items-center mb-10">
                              <h4 className="m0 xs-pb-30">Reviews</h4>
                              <NiceSelect className="nice-select rounded-0"
                                 options={[
                                    { value: "01", text: "Newest" },
                                    { value: "02", text: "Best Seller" },
                                    { value: "03", text: "Best Match" },
                                 ]}
                                 defaultCurrent={0}
                                 onChange={selectHandler}
                                 name=""
                                 placeholder="" />
                           </div>
                           <Review />
                        </div>
                     </div>
                     
                     <div className="review-form">
                        <h4 className="mb-20">השאר תגובה</h4>
                        <p className="fs-20 lh-lg pb-15">
                           <a onClick={() => setLoginModal(true)} style={{ cursor: "pointer" }}
                              className="color-dark fw-500 text-decoration-underline">Sign in</a>
                           to post your comment or signup if you don&apos;t have any account.</p>

                        <div className="bg-dot p-30">
                           <AgencyFormOne />
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-4 col-lg-8 me-auto ms-auto">
            <div className="theme-sidebar-one dot-bg p-30 ms-xxl-3 lg-mt-80">
               <div className="agent-info bg-white border-20 p-30 mb-40">
                  <SidebarInfo contactButtonText="צור קשר" />
               </div>
               <div className="tour-schedule bg-white border-20 p-30 mb-40">
                  <h5 className="mb-40">קבע פגישה</h5>
                  <ScheduleForm />
               </div>
               <div className="mortgage-calculator bg-white border-20 p-30 mb-40">
                  <h5 className="mb-40">מחשבון עלות חודשית</h5>
                  <form onSubmit={(e) => e.preventDefault()}>
                     <div className="row">
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">שטח מ&quot;ר</div>
                              <input type="number" className="type-input" value={area} onChange={(e) => setArea(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">שכ&quot;ד למ&quot;ר</div>
                              <input type="number" className="type-input" value={rentPerSqm} onChange={(e) => setRentPerSqm(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">דמי ניהול למ&quot;ר</div>
                              <input type="number" className="type-input" value={mgmt} onChange={(e) => setMgmt(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">ארנונה למ&quot;ר</div>
                              <input type="number" className="type-input" value={arnona} onChange={(e) => setArnona(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">ניקיון למ&quot;ר</div>
                              <input type="number" className="type-input" value={cleaning} onChange={(e) => setCleaning(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">חשמל+מים</div>
                              <input type="number" className="type-input" value={elec} onChange={(e) => setElec(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">חניות</div>
                              <input type="number" className="type-input" value={parking} onChange={(e) => setParking(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">מחיר חניה</div>
                              <input type="number" className="type-input" value={parkingPrice} onChange={(e) => setParkingPrice(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">גרייס/חודשים</div>
                              <input type="number" className="type-input" value={grace} onChange={(e) => setGrace(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="input-box-three mb-25">
                              <div className="label">משך חוזה</div>
                              <input type="number" className="type-input" value={months} onChange={(e) => setMonths(Number(e.target.value) || 0)} />
                           </div>
                        </div>
                        <div className="col-12">
                           <div className="agreement-checkbox d-flex align-items-center mb-25">
                              <input type="checkbox" id="tech-discount" checked={techDiscount} onChange={(e) => setTechDiscount(e.target.checked)} />
                              <label htmlFor="tech-discount">הנחת טק 35% על ארנונה</label>
                           </div>
                        </div>
                     </div>
                     <div className="divider-line mt-30 mb-30 pt-20">
                        <div className="d-flex justify-content-between mb-2">
                           <span>סה&quot;כ חודשי:</span>
                           <strong className="price fw-500 color-dark">₪{monthlyTotal.toLocaleString("he-IL")}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                           <span>סה&quot;כ שנתי:</span>
                           <strong className="price fw-500 color-dark">₪{yearlyTotal.toLocaleString("he-IL")}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                           <span>עלות אפקטיבית:</span>
                           <strong className="price fw-500 color-dark">₪{effectiveMonthly.toLocaleString("he-IL")}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                           <span>עלות למ&quot;ר:</span>
                           <strong className="price fw-500 color-dark">₪{perSqm.toLocaleString("he-IL")}</strong>
                        </div>
                     </div>
                     <button type="button" className="btn-two w-100" onClick={handleSendInquiry}>
                        <span>שלח פנייה לברק</span>
                     </button>
                  </form>
               </div>
               <FeatureListing />
            </div>
         </div>
               </div>
            </div>
         </div>

         <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
      </>
   )
}

export default ListingDetailsSixArea

"use client";

interface WarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function WarningModal({
  isOpen,
  onConfirm,
  onCancel,
}: WarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        data-pop-up-type="Warning"
        className="w-[258px] p-8 bg-white rounded-2xl shadow-[-1px_3px_4px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col justify-center items-center gap-6"
      >
        <div className="self-stretch flex flex-col justify-center items-center gap-4">
          {/* Icon_Warning - SVG จาก Figma */}
          <div
            data-property-1="Icon_Warning"
            className="w-[124px] h-[110px] relative overflow-hidden flex items-center justify-center shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={124} height={110} viewBox="0 0 124 110" fill="none" className="shrink-0">
              <path d="M99.4717 60.0098H53.7517C50.1674 60.0098 47.2617 62.9132 47.2617 66.4948C47.2617 70.0763 50.1674 72.9798 53.7517 72.9798H99.4717C103.056 72.9798 105.962 70.0763 105.962 66.4948C105.962 62.9132 103.056 60.0098 99.4717 60.0098Z" fill="#FBF2D9" />
              <path d="M77.1905 72.9805H31.4705C27.8861 72.9805 24.9805 75.8839 24.9805 79.4655C24.9805 83.047 27.8861 85.9505 31.4705 85.9505H77.1905C80.7748 85.9505 83.6805 83.047 83.6805 79.4655C83.6805 75.8839 80.7748 72.9805 77.1905 72.9805Z" fill="#FBF2D9" />
              <path d="M67.8702 45.3496H22.1502C18.5658 45.3496 15.6602 48.253 15.6602 51.8346C15.6602 55.4162 18.5658 58.3196 22.1502 58.3196H67.8702C71.4545 58.3196 74.3602 55.4162 74.3602 51.8346C74.3602 48.253 71.4545 45.3496 67.8702 45.3496Z" fill="#FBF2D9" />
              <path d="M65.5414 99.0105C88.3784 99.0105 106.891 80.4975 106.891 57.6605C106.891 34.8236 88.3784 16.3105 65.5414 16.3105C42.7044 16.3105 24.1914 34.8236 24.1914 57.6605C24.1914 80.4975 42.7044 99.0105 65.5414 99.0105Z" stroke="#FEC111" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M99.3617 18.8504C101.626 18.8504 103.462 17.0148 103.462 14.7504C103.462 12.486 101.626 10.6504 99.3617 10.6504C97.0973 10.6504 95.2617 12.486 95.2617 14.7504C95.2617 17.0148 97.0973 18.8504 99.3617 18.8504Z" stroke="#FEC111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M102.959 98.91C105.224 98.91 107.059 97.0743 107.059 94.81C107.059 92.5456 105.224 90.71 102.959 90.71C100.695 90.71 98.8594 92.5456 98.8594 94.81C98.8594 97.0743 100.695 98.91 102.959 98.91Z" stroke="#FEC111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.6586 77.5106C16.923 77.5106 18.7586 75.6749 18.7586 73.4106C18.7586 71.1462 16.923 69.3105 14.6586 69.3105C12.3942 69.3105 10.5586 71.1462 10.5586 73.4106C10.5586 75.6749 12.3942 77.5106 14.6586 77.5106Z" stroke="#FEC111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M115.148 46.6895V54.0894" stroke="#FEC111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M115.15 59.7401C115.747 59.7401 116.23 59.2565 116.23 58.6601C116.23 58.0636 115.747 57.5801 115.15 57.5801C114.554 57.5801 114.07 58.0636 114.07 58.6601C114.07 59.2565 114.554 59.7401 115.15 59.7401Z" fill="#FEC111" stroke="#FEC111" strokeMiterlimit={10} />
              <path d="M22.7188 18.5098V25.9198" stroke="#FEC111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22.7206 31.5702C23.3171 31.5702 23.8006 31.0866 23.8006 30.4902C23.8006 29.8937 23.3171 29.4102 22.7206 29.4102C22.1242 29.4102 21.6406 29.8937 21.6406 30.4902C21.6406 31.0866 22.1242 31.5702 22.7206 31.5702Z" fill="#FEC111" stroke="#FEC111" strokeMiterlimit={10} />
              <path d="M54.702 49.0728C55.2399 46.1843 53.9198 43.5157 51.7535 43.1122C49.5871 42.7087 47.3948 44.7232 46.8569 47.6117C46.3189 50.5002 47.639 53.1689 49.8054 53.5723C51.9717 53.9758 54.164 51.9613 54.702 49.0728Z" fill="#FEC111" />
              <path d="M78.5262 51.3531C79.0642 48.4646 77.7441 45.7959 75.5777 45.3925C73.4113 44.989 71.219 47.0035 70.6811 49.892C70.1431 52.7805 71.4632 55.4491 73.6296 55.8526C75.7959 56.2561 77.9882 54.2416 78.5262 51.3531Z" fill="#FEC111" />
              <path d="M58.1887 39.2699C58.1887 39.2699 59.2687 39.5699 59.2587 40.2999C59.2587 40.2999 59.4587 41.8999 56.6087 41.8499C55.3187 41.8299 54.0287 41.4799 52.9087 40.8599C52.2187 40.4799 51.5187 40.1099 50.7887 39.7999C50.1887 39.5399 49.5687 39.2699 48.9087 39.1699C48.0187 39.0399 47.1287 39.3799 46.3087 39.6699C45.3987 39.9999 44.5287 40.3999 43.6787 40.8499C43.4587 40.9699 42.5987 41.4899 42.4187 41.0799C42.1787 40.5099 42.9887 39.9099 43.3387 39.5599C43.8387 39.0699 44.3687 38.5899 44.9487 38.1699C45.8887 37.4899 47.0787 36.8799 48.2987 36.8999C50.9387 36.9399 53.4587 38.9699 55.8887 39.0299C57.6287 39.0699 58.1887 39.2599 58.1887 39.2599V39.2699Z" fill="#FEC111" stroke="#FEC111" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M79.7978 36.7398C79.7978 36.7398 82.7578 38.2798 82.4578 37.0498C81.9378 34.9698 80.0378 33.8298 78.0078 33.5698C77.2078 33.4698 76.3578 33.4098 75.5478 33.5198C74.7278 33.6398 73.9478 33.9298 73.1478 34.1698C71.4078 34.6798 69.5978 34.8898 67.8878 35.4898C67.2078 35.7298 66.3578 36.5198 66.8978 37.2798C67.1778 37.6698 67.7178 37.9398 68.1878 37.7498C68.4778 37.6398 68.7778 37.5198 69.0678 37.4098C69.8778 37.0998 70.6878 36.7898 71.4978 36.4698C71.8278 36.3398 72.1478 36.2198 72.4778 36.0898C72.5878 36.0498 72.7578 35.9398 72.8778 35.9398L76.3478 35.7598L79.7978 36.7398Z" fill="#FEC111" stroke="#FEC111" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M71.2402 73.3895C71.1002 73.3895 70.9602 73.3595 70.8302 73.2895C64.7402 70.0095 60.3802 70.0195 57.1902 70.0195H56.8002C53.6902 70.0195 51.6402 70.4995 51.6202 70.4995C51.1502 70.6095 50.6802 70.3195 50.5702 69.8495C50.4602 69.3795 50.7502 68.9095 51.2202 68.7995C51.3102 68.7795 53.4702 68.2695 56.8102 68.2695H57.2002C60.5702 68.2695 65.1902 68.2595 71.6702 71.7495C72.0902 71.9795 72.2502 72.5095 72.0202 72.9295C71.8602 73.2195 71.5602 73.3895 71.2502 73.3895H71.2402Z" fill="#FEC111" stroke="#FEC111" strokeMiterlimit={10} />
            </svg>
          </div>
          <div className="flex flex-col justify-start items-center gap-2">
            <div className="text-center text-[#FFC107] text-xl font-semibold font-['IBM_Plex_Sans_Thai'] leading-8">
              Warning
            </div>
            <div className="text-center text-[#2A2A2A] text-base font-normal font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
              Do you want to Check In ?
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-center gap-6">
          <div className="self-stretch flex justify-start items-start gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-5 py-2 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[#265ED6] flex justify-center items-center gap-2 hover:bg-blue-50/50 transition-colors"
            >
              <span className="text-[#265ED6] text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                Cancel
              </span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-5 py-2 bg-[#265ED6] rounded-[100px] flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="text-white text-base font-medium font-['IBM_Plex_Sans_Thai'] leading-6 tracking-[0.02em]">
                Ok
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

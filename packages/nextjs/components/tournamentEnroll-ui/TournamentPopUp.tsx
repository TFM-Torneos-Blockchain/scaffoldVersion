import React from "react";

export default function TournamentPopUp({tournamentInfo}: {tournamentInfo: any}) {
  const [showModal, setShowModal] = React.useState(false);
  return (
    <>
      <button
        className="w-56 bg-white text-slate-950 active:bg-slate-700 active:text-white font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Show more information
      </button>
      {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-slate-950 outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5  rounded-t">
                  <h3 className="text-3xl font-semibold">
                     TOURNAMENT #{tournamentInfo.id}
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
               
      <div className="text-white overflow-y-auto ">
        {Object.entries(tournamentInfo).map(([key, value]:[any,any]) => (
            <div className="my-2 flex flex-row w-max">
            <div className="rounded  w-auto h-8 bg-slate-700 px-3 flex justify-center items-center">
                <span>{key}</span>
            </div>
            <div className="w-auto h-8  px-3 flex justify-center items-center">
                <p key={key} className="text-base">
                    {value}
                </p>
            </div>
          </div>
        ))}
      </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 rounded-b">
                  <button
                    className="rounded bg-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}

import { useEffect, useRef } from "react";
import { AbortMultipartS3, CloseMultipartS3, PickOnly, QueryApiEndpoint } from "../Redux";

type BeforeunloadHandler = (evt: BeforeUnloadEvent) => void;

export const useBeforeunload = (
  handler: BeforeunloadHandler,
  activeLoad: boolean,
  abortMultipartS3: QueryApiEndpoint<AbortMultipartS3>,
  saveMultipartData: PickOnly<CloseMultipartS3, 'Bucket' | 'UploadId' | 'Key'>
) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleBeforeunload: BeforeunloadHandler = evt => {
      let returnValue;

      if (!activeLoad) {
        returnValue = ''
        return returnValue
      }else {
        abortMultipartS3.initiate(saveMultipartData)
      }
    };

    window.addEventListener("beforeunload", handleBeforeunload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
    };
  }, [activeLoad, abortMultipartS3, saveMultipartData]);
}
(ns mailcrunch.view.list
  (:require [mailcrunch.backend.list :as model]
            [cheshire.core :as ch]
            [mailcrunch.view.util :as util])
  (:use [liberator.core :only [defresource request-method-in]]))

(defresource handle-list-count
  :handle-ok (ch/generate-string (first (model/count)))
  :available-media-types ["text/json" "application/json"])


(defresource all-lists
  :handle-ok (fn [ctx]
               (ch/generate-string (model/get-lists)))
  :available-media-types ["text/json" "application/json"]
 )


(defresource handle-single-list [id]
        :handle-ok (if (not (nil? id))
                     (ch/generate-string (model/get-lists {:id (Integer. id)}))
                     (ch/generate-string (model/get-lists)))
        :available-media-types ["text/json" "application/json"]
        :method-allowed? (request-method-in :post :get :put :delete)
        :post! (fn [ctx]
                 (let [id (-> ctx
                              (get-in [:request :form-params] )
                              (first)
                              (val)
                              (ch/parse-string true)
                              (model/save-list))]
                   {:result id}))
        :post-redirect? false
        :delete! (fn [ctx]
                   (-> ctx
                       (util/get-ids-from-ctx)
                       (model/delete-by-ids))
                   {:result "OK"})

        :handle-created (fn [ctx] (get ctx :result))
 )

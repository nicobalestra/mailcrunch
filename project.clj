(defproject mailcrunch "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.0-RC14"]
                 [liberator "0.8.0"]
                 [compojure "1.1.5"]
                 [ring "1.2.0-beta1"]
                 [ring/ring-core "1.2.0-beta1"]]

  :ring {:handler mailcrunch.server/entry
         :adapter {:port 8000}}

  )

(defproject mailcrunch "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [korma "0.3.0-RC4"]
                 [com.draines/postal "1.9.0"]
                 [postgresql "9.1-901.jdbc4"]
                 [com.draines/postal "1.8.0"]
                 [liberator "0.8.0"]
                 [compojure "1.1.5"]
                 [ring "1.2.0-beta1"]
                 [ring/ring-core "1.2.0-beta1"]
                 [cheshire "5.0.2"]
                 [ring/ring-json "0.2.0"]]

  :ring {:handler mailcrunch.server/entry
         :adapter {:port 8000}}

  )

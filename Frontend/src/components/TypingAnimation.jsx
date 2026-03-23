import React, { useState, useEffect, useRef } from 'react';

// Define the lines of code
const codeLines = [
  '<span class="token-linenum">01</span> <span class="token-comment">// ByteRank.cpp: Advanced Ranking Algorithm</span>',
  '<span class="token-linenum">02</span> ',
  '<span class="token-linenum">03</span> <span class="token-include">#include</span> <span class="token-string">&lt;iostream&gt;</span>',
  '<span class="token-linenum">04</span> <span class="token-include">#include</span> <span class="token-string">&lt;string&gt;</span>',
  '<span class="token-linenum">05</span> <span class="token-include">#include</span> <span class="token-string">&lt;vector&gt;</span>',
  '<span class="token-linenum">06</span> <span class="token-include">#include</span> <span class="token-string">&lt;memory&gt;</span>',
  '<span class="token-linenum">07</span> <span class="token-include">#include</span> <span class="token-string">&lt;map&gt;</span>',
  '<span class="token-linenum">08</span> <span class="token-include">#include</span> <span class="token-string">&lt;set&gt;</span>',
  '<span class="token-linenum">09</span> <span class="token-include">#include</span> <span class="token-string">&lt;cmath&gt;</span>',
  '<span class="token-linenum">10</span> <span class="token-include">#include</span> <span class="token-string">&lt;thread&gt;</span>',
  '<span class="token-linenum">11</span> <span class="token-include">#include</span> <span class="token-string">&lt;mutex&gt;</span>',
  '<span class="token-linenum">12</span> ',
  '<span class="token-linenum">13</span> <span class="token-keyword">using</span> <span class="token-keyword">namespace</span> <span class="token-default">std</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">14</span> ',
  '<span class="token-linenum">15</span> <span class="token-comment">/*</span>',
  '<span class="token-linenum">16</span> <span class="token-comment"> * Core class for calculating page and user trust ranks.</span>',
  '<span class="token-linenum">17</span> <span class="token-comment"> */</span>',
  '<span class="token-linenum">18</span> <span class="token-keyword">class</span> <span class="token-type">ByteRank</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">19</span> <span class="token-keyword">public</span><span class="token-punctuation">:</span>',
  '<span class="token-linenum">20</span>     <span class="token-comment">// Constructor</span>',
  '<span class="token-linenum">21</span>     <span class="token-type">ByteRank</span><span class="token-punctuation">(</span><span class="token-type">double</span> <span class="token-variable">d</span> <span class="token-operator">=</span> <span class="token-number">0.85</span><span class="token-punctuation">,</span> <span class="token-type">int</span> <span class="token-variable">iter</span> <span class="token-operator">=</span> <span class="token-number">10</span><span class="token-punctuation">)</span> : <span class="token-variable">dampingFactor</span><span class="token-punctuation">(</span><span class="token-variable">d</span><span class="token-punctuation">),</span> <span class="token-variable">maxIterations</span><span class="token-punctuation">(</span><span class="token-variable">iter</span><span class="token-punctuation">)</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">22</span>         <span class="token-function">cout</span> <span class="token-operator">&lt;&lt;</span> <span class="token-string">"ByteRank instance created."</span> <span class="token-operator">&lt;&lt;</span> <span class="token-default">endl</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">23</span>     <span class="token-punctuation">}</span>',
  '<span class="token-linenum">24</span> ',
  '<span class="token-linenum">25</span>     <span class="token-comment">// Add a new link to the graph (thread-safe)</span>',
  '<span class="token-linenum">26</span>     <span class="token-type">void</span> <span class="token-function">addLink</span><span class="token-punctuation">(</span><span class="token-type">string</span> <span class="token-variable">fromNode</span><span class="token-punctuation">,</span> <span class="token-type">string</span> <span class="token-variable">toNode</span><span class="token-punctuation">)</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">27</span>         <span class="token-type">lock_guard</span><span class="token-operator">&lt;</span><span class="token-type">mutex</span><span class="token-operator">&gt;</span> <span class="token-variable">lock</span><span class="token-punctuation">(</span><span class="token-variable">mtx</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">28</span>         <span class="token-variable">adjacencyList</span><span class="token-punctuation">[</span><span class="token-variable">fromNode</span><span class="token-punctuation">].</span><span class="token-function">push_back</span><span class="token-punctuation">(</span><span class="token-variable">toNode</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">29</span>         <span class="token-variable">nodes</span><span class="token-punctuation">.</span><span class="token-function">insert</span><span class="token-punctuation">(</span><span class="token-variable">fromNode</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">30</span>         <span class="token-variable">nodes</span><span class="token-punctuation">.</span><span class="token-function">insert</span><span class="token-punctuation">(</span><span class="token-variable">toNode</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">31</span>     <span class="token-punctuation">}</span>',
  '<span class="token-linenum">32</span> ',
  '<span class="token-linenum">33</span>     <span class="token-comment">// Run the ranking algorithm</span>',
  '<span class="token-linenum">34</span>     <span class="token-type">void</span> <span class="token-function">calculateRanks</span><span class="token-punctuation">()</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">35</span>         <span class="token-type">int</span> <span class="token-variable">N</span> <span class="token-operator">=</span> <span class="token-variable">nodes</span><span class="token-punctuation">.</span><span class="token-function">size</span><span class="token-punctuation">();</span>',
  '<span class="token-linenum">36</span>         <span class="token-keyword">if</span> <span class="token-punctuation">(</span><span class="token-variable">N</span> <span class="token-operator">==</span> <span class="token-number">0</span><span class="token-punctuation">)</span> <span class="token-keyword">return</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">37</span> ',
  '<span class="token-linenum">38</span>         <span class="token-comment">// ... complex algorithm logic ...</span>',
  '<span class="token-linenum">39</span>         <span class="token-keyword">for</span><span class="token-punctuation">(</span><span class="token-type">int</span> <span class="token-variable">i</span> <span class="token-operator">=</span> <span class="token-number">0</span><span class="token-punctuation">;</span> <span class="token-variable">i</span> <span class="token-operator">&lt;</span> <span class="token-variable">maxIterations</span><span class="token-punctuation">;</span> <span class="token-variable">i</span><span class="token-operator">++</span><span class="token-punctuation">)</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">40</span>             <span class="token-comment">// ... processing in parallel ...</span>',
  '<span class="token-linenum">41</span>         <span class="token-punctuation">}</span>',
  '<span class="token-linenum">42</span>         <span class="token-function">cout</span> <span class="token-operator">&lt;&lt;</span> <span class="token-string">"Ranks calculated."</span> <span class="token-operator">&lt;&lt;</span> <span class="token-default">endl</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">43</span>     <span class="token-punctuation">}</span>',
  '<span class="token-linenum">44</span> ',
  '<span class="token-linenum">45</span>     <span class="token-comment">// Get rank for a specific node</span>',
  '<span class="token-linenum">46</span>     <span class="token-type">double</span> <span class="token-function">getRank</span><span class="token-punctuation">(</span><span class="token-type">string</span> <span class="token-variable">node</span><span class="token-punctuation">)</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">47</span>         <span class="token-type">lock_guard</span><span class="token-operator">&lt;</span><span class="token-type">mutex</span><span class="token-operator">&gt;</span> <span class="token-variable">lock</span><span class="token-punctuation">(</span><span class="token-variable">mtx</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">48</span>         <span class="token-keyword">if</span> <span class="token-punctuation">(</span><span class="token-variable">ranks</span><span class="token-punctuation">.</span><span class="token-function">count</span><span class="token-punctuation">(</span><span class="token-variable">node</span><span class="token-punctuation">))</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">49</span>             <span class="token-keyword">return</span> <span class="token-variable">ranks</span><span class="token-punctuation">[</span><span class="token-variable">node</span><span class="token-punctuation">];</span>',
  '<span class="token-linenum">50</span>         <span class="token-punctuation">}</span>',
  '<span class="token-linenum">51</span>         <span class="token-keyword">return</span> <span class="token-number">0.0</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">52</span>     <span class="token-punctuation">}</span>',
  '<span class="token-linenum">53</span> ',
  '<span class="token-linenum">54</span> <span class="token-keyword">private</span><span class="token-punctuation">:</span>',
  '<span class="token-linenum">55</span>     <span class="token-type">double</span> <span class="token-variable">dampingFactor</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">56</span>     <span class="token-type">int</span> <span class="token-variable">maxIterations</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">57</span>     <span class="token-type">mutex</span> <span class="token-variable">mtx</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">58</span>     <span class="token-type">map</span><span class="token-operator">&lt;</span><span class="token-type">string</span><span class="token-punctuation">,</span> <span class="token-type">vector</span><span class="token-operator">&lt;</span><span class="token-type">string</span><span class="token-operator">&gt;&gt;</span> <span class="token-variable">adjacencyList</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">59</span>     <span class="token-type">map</span><span class="token-operator">&lt;</span><span class="token-type">string</span><span class="token-punctuation">,</span> <span class="token-type">double</span><span class="token-operator">&gt;</span> <span class="token-variable">ranks</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">60</span>     <span class="token-type">set</span><span class="token-operator">&lt;</span><span class="token-type">string</span><span class="token-operator">&gt;</span> <span class="token-variable">nodes</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">61</span> <span class="token-punctuation">};</span>',
  '<span class="token-linenum">62</span> ',
  '<span class="token-linenum">63</span> <span class="token-comment">// Main entry point</span>',
  '<span class="token-linenum">64</span> <span class="token-type">int</span> <span class="token-function">main</span><span class="token-punctuation">()</span> <span class="token-punctuation">{</span>',
  '<span class="token-linenum">65</span>     <span class="token-type">ByteRank</span> <span class="token-variable">ranker</span><span class="token-punctuation">(</span><span class="token-number">0.85</span><span class="token-punctuation">,</span> <span class="token-number">15</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">66</span>     <span class="token-variable">ranker</span><span class="token-punctuation">.</span><span class="token-function">addLink</span><span class="token-punctuation">(</span><span class="token-string">"nodeA"</span><span class="token-punctuation">,</span> <span class="token-string">"nodeB"</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">67</span>     <span class="token-variable">ranker</span><span class="token-punctuation">.</span><span class="token-function">addLink</span><span class="token-punctuation">(</span><span class="token-string">"nodeA"</span><span class="token-punctuation">,</span> <span class="token-string">"nodeC"</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">68</span>     <span class="token-variable">ranker</span><span class="token-punctuation">.</span><span class="token-function">addLink</span><span class="token-punctuation">(</span><span class="token-string">"nodeB"</span><span class="token-punctuation">,</span> <span class="token-string">"nodeC"</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">69</span>     <span class="token-variable">ranker</span><span class="token-punctuation">.</span><span class="token-function">addLink</span><span class="token-punctuation">(</span><span class="token-string">"nodeC"</span><span class="token-punctuation">,</span> <span class="token-string">"nodeA"</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">70</span>     <span class="token-variable">ranker</span><span class="token-punctuation">.</span><span class="token-function">addLink</span><span class="token-punctuation">(</span><span class="token-string">"nodeD"</span><span class="token-punctuation">,</span> <span class="token-string">"nodeA"</span><span class="token-punctuation">);</span>',
  '<span class="token-linenum">71</span>     <span class="token-keyword">return</span> <span class="token-number">0</span><span class="token-punctuation">;</span>',
  '<span class="token-linenum">72</span> <span class="token-punctuation">}</span>',
];

const cursorHtml = '<span class="typing-cursor"></span>';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getPlainText(html) {
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  return html.replace(/<[^>]+>/g, '');
}

function TypingAnimation() {
  const [codeOutput, setCodeOutput] = useState(cursorHtml);
  const codeContainerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isRunningRef = useRef(false); // ✅ Track if animation is running

  useEffect(() => {
    // ✅ If animation is already running, don't start another
    if (isRunningRef.current) {
      console.log("⚠️ Animation already running, skipping...");
      return;
    }

    isRunningRef.current = true;
    isMountedRef.current = true;
    console.log("🎬 Starting typing animation...");

    const infiniteType = async () => {
      while (isMountedRef.current) {
        try {
          // --- PHASE 1: TYPING ---
          let currentHtml = '';
          
          for (let i = 0; i < codeLines.length; i++) {
            if (!isMountedRef.current) {
              console.log("🛑 Component unmounted during typing");
              return;
            }
            
            const lineHtml = codeLines[i];
            const plainText = getPlainText(lineHtml);
            let typedLine = '';
            
            // Type letter by letter
            for (let j = 0; j < plainText.length; j++) {
              if (!isMountedRef.current) return;
              
              typedLine += plainText[j];
              
              // ✅ Use callback form to avoid stale state
              setCodeOutput(() => currentHtml + typedLine + cursorHtml);
              
              // Auto-scroll
              requestAnimationFrame(() => {
                if (codeContainerRef.current) {
                  codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
                }
              });
              
              await wait(Math.random() * 50 + 25);
            }

            // Replace with full HTML line
            currentHtml += lineHtml + '\n';
            setCodeOutput(() => currentHtml + cursorHtml);
            
            requestAnimationFrame(() => {
              if (codeContainerRef.current) {
                codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
              }
            });
            
            await wait(Math.random() * 60 + 30);
          }
          
          // Pause after typing
          if (!isMountedRef.current) return;
          await wait(3000);

          // --- PHASE 2: DELETING ---
          for (let i = codeLines.length - 1; i >= 0; i--) {
            if (!isMountedRef.current) {
              console.log("🛑 Component unmounted during deletion");
              return;
            }

            let htmlBefore = '';
            for (let k = 0; k < i; k++) {
              htmlBefore += codeLines[k] + '\n';
            }

            const lineHtml = codeLines[i];
            const plainText = getPlainText(lineHtml);
            
            for (let j = plainText.length; j >= 0; j--) {
              if (!isMountedRef.current) return;

              let typedLine = plainText.substring(0, j);
              setCodeOutput(() => htmlBefore + typedLine + cursorHtml);

              requestAnimationFrame(() => {
                if (codeContainerRef.current) {
                  codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
                }
              });
              
              await wait(Math.random() * 20 + 10);
            }
            
            setCodeOutput(() => htmlBefore + cursorHtml);
            await wait(Math.random() * 30 + 15);
          }

          // All deleted
          if (!isMountedRef.current) return;
          setCodeOutput(() => cursorHtml);
          await wait(1500);
          
        } catch (error) {
          console.error("❌ Animation error:", error);
          if (!isMountedRef.current) return;
          await wait(2000);
        }
      }
    };

    // ✅ Start animation with slight delay
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        infiniteType();
      }
    }, 200);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up typing animation...");
      clearTimeout(timer);
      isMountedRef.current = false;
      isRunningRef.current = false;
    };
  }, []); // ✅ Empty deps - only run once

  return (
    <div className="code-editor">
      <div className="title-bar">
        <div className="controls">
          <span className="control-dot dot-red"></span>
          <span className="control-dot dot-yellow"></span>
          <span className="control-dot dot-green"></span>
        </div>
        <span className="title-text">ByteRank.cpp</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>REC</span>
        </div>
      </div>
      <div id="code-area-container" className="code-area" ref={codeContainerRef}>
        <pre>
          <code id="code-output" dangerouslySetInnerHTML={{ __html: codeOutput }} />
        </pre>
      </div>
    </div>
  );
}

export default TypingAnimation;


const ignoredDestinations=new Set(["fonttbl","colortbl","stylesheet","info","pict","object","objdata","themedata","colorschememapping","datastore","xmlnstbl","listtable","listoverridetable","latentstyles","generator"]);

function removeIgnoredGroups(source:string){let output="";for(let index=0;index<source.length;){if(source[index]!=="{"){output+=source[index++];continue}let cursor=index+1;while(/\s/.test(source[cursor]||""))cursor++;let starred=false;if(source.slice(cursor,cursor+2)==="\\*"){starred=true;cursor+=2}const destination=source.slice(cursor).match(/^\\([a-z]+)/i)?.[1]?.toLowerCase();if(!starred&&!ignoredDestinations.has(destination||"")){output+="{";index++;continue}let depth=1;cursor=index+1;for(;cursor<source.length&&depth;cursor++){if(source[cursor]==="{"&&(cursor===0||source[cursor-1]!=="\\"))depth++;else if(source[cursor]==="}"&&(cursor===0||source[cursor-1]!=="\\"))depth--}index=cursor}return output}

function decodeHex(text:string,encoding:string){let decoder:TextDecoder;try{decoder=new TextDecoder(encoding)}catch{decoder=new TextDecoder("windows-1252")}return text.replace(/\\'([0-9a-f]{2})/gi,(_,hex)=>decoder.decode(Uint8Array.of(parseInt(hex,16))))}

function normalizeLine(line:string){
  const member=line.match(/^[-–]\s*(.+?)\s{2,}[-–]\s*(.+)$/);
  if(member)return"• "+member[1].trim()+"\t"+member[2].trim();
  const parallel=line.match(/^(\d{1,2}:\d{2})\t(.*)$/);
  if(parallel){
    const blankLaneA=/^ {20,}/.test(parallel[2]);
    const cells=parallel[2].trim().split(/ {2,}/).map(part=>part.trim()).filter(Boolean);
    if(cells.length===2){
      return blankLaneA
        ?`${parallel[1]}\t\t\t${cells[0]}\t${cells[1]}`
        :`${parallel[1]}\t${cells[0]}\t${cells[1]}`;
    }
    return[parallel[1],...cells].join("\t");
  }
  return line.split(/\t| {2,}/).map(part=>part.trim()).filter(Boolean).join("\t");
}

export function rtfToText(rtf:string){
  const codePage=rtf.match(/\\ansicpg(\d+)/i)?.[1]||"1252";
  let text=removeIgnoredGroups(rtf.replace(/\0/g,"").replace(/\r?\n/g,""));
  text=decodeHex(text,"windows-"+codePage)
    .replace(/\\u(-?\d+)\??/g,(_,value)=>String.fromCharCode(Number(value)<0?Number(value)+65536:Number(value)))
    .replace(/\\(?:par|line|page)\b\s?/gi,"\n")
    .replace(/\\(?:cell|nestcell)\b\s?/gi,"\t")
    .replace(/\\(?:row|nestrow)\b\s?/gi,"\n")
    .replace(/\\tab\b\s?/gi,"\t")
    .replace(/\\emdash\b\s?/gi,"—")
    .replace(/\\endash\b\s?/gi,"–")
    .replace(/\\bullet\b\s?/gi,"• ")
    .replace(/\\~|\\_/g," ")
    .replace(/\\[a-z]+-?\d*\s?/gi,"")
    .replace(/\\([{}\\])/g,"$1")
    .replace(/[{}]/g,"");
  const lines=text.split("\n").map(line=>line.trim()).filter(Boolean).map(normalizeLine);
  return lines.join("\n").trim();
}

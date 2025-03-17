const imageFormats = ["png", "jpeg", "gif", "bmp", "webp"];

const outputFormatElement = document.getElementById("output-format") as HTMLInputElement;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

const formatSuggestionsElement = document.getElementById("format-suggestions") as HTMLDataListElement;
const uploadAreaElement = document.getElementById('upload-area') as HTMLDivElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const doSaveInput = document.getElementById("do-save") as HTMLInputElement;
const imagePreviewElement = document.getElementById("image-previews") as HTMLDivElement;

outputFormatElement.onchange = () => {
	if (outputFormatElement.value.length === 0) {
		outputFormatElement.value = imageFormats[0];
	}

	const format = outputFormatElement.value;

	if (!supportsImgFormat(format)) {
		outputFormatElement.classList.add("invalid")
	} else {
		outputFormatElement.classList.remove("invalid");
	}
}

formatSuggestionsElement.innerHTML = imageFormats.map((f) => `<option value="${f}"></option>`).join("");

uploadAreaElement.addEventListener('click', () => fileInput.click());

uploadAreaElement.addEventListener('dragover', (event) => {
	event.preventDefault();
	uploadAreaElement.classList.add('drag-over');
});

uploadAreaElement.addEventListener('dragleave', () => {
	uploadAreaElement.classList.remove('drag-over');
});

uploadAreaElement.addEventListener('drop', (event) => {
	event.preventDefault();
	uploadAreaElement.classList.remove('drag-over');
	if (event.dataTransfer == null) return;

	const files = event.dataTransfer.files;

	if (files.length == 0) return;

	convertFiles(files);
});

document.getElementById("file-input")!.onchange = (e) => {
	const el = e.target as HTMLInputElement;

	if (el.files == null || el.files.length == 0) return;

	convertFiles(el.files);
}

function convertFiles(files: FileList) {
	if (!supportsImgFormat(outputFormatElement.value)) {
		alert("Target Image format not supported");
		return;
	}

	imagePreviewElement.innerHTML = "";

	for (const file of files) {
		convertFile(file);
	}
}

function convertFile(file: File) {
	const img = new Image();
	const outputFormat = outputFormatElement.value;

	if (file.type === "image/" + outputFormat
		&& !confirm("Original and target file-type look to be the same!\nContinue anyway?")
	) {
		return;
	}

	img.src = URL.createObjectURL(file);

	console.log(file.name);
	img.onload = () => {
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;

		ctx.drawImage(img, 0, 0);
		const img_url = canvas.toDataURL("image/" + outputFormat);
		downloadUrl(img_url, file.name);
	}
	img.onerror = () => {
		alert("Could not load image!");
	}
}

function downloadUrl(url: string, filename: string) {
	if(doSaveInput.checked) {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
	}else {
		const img = document.createElement("img");
		img.src = url;
		img.onclick = () => {
			window.open(img.src)
		}
		imagePreviewElement.appendChild(img);
	}
}


const supportCanvas = document.createElement("canvas");

function supportsImgFormat(format: string) {
	if (format === "png") return true;

	return !supportCanvas.toDataURL("image/" + format).startsWith("data:image/png");
}